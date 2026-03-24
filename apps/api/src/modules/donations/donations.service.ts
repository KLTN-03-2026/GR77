import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';
import { Prisma } from '@prisma/client';

@Injectable()
export class DonationsService {
    private readonly logger = new Logger(DonationsService.name);
    private payOS: PayOS;

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
    ) {
        const clientId = this.config.get<string>('PAYOS_CLIENT_ID')?.trim();
        const apiKey = this.config.get<string>('PAYOS_API_KEY')?.trim();
        const checksumKey = this.config.get<string>('PAYOS_CHECKSUM_KEY')?.trim();

        this.payOS = new PayOS({
            clientId: clientId || 'fake',
            apiKey: apiKey || 'fake',
            checksumKey: checksumKey || 'fake'
        });
    }

    async create(userId: string | null, dto: CreateDonationDto) {
        this.logger.log(`Creating donation. User: ${userId}, Campaign: ${dto.campaignId}, Amount: ${dto.amount}, UseWallet: ${dto.useWallet}`);

        const campaign = await (this.prisma as any).campaign.findUnique({
            where: { id: dto.campaignId },
        });

        if (!campaign) throw new NotFoundException('Campaign not found');
        if (campaign.status !== 'ACTIVE') throw new BadRequestException('Campaign is not active');

        // -- WALLET DONATION --
        if (dto.useWallet) {
            if (!userId) throw new BadRequestException('Must be logged in to use wallet');

            return await (this.prisma as any).$transaction(async (tx: any) => {
                const user = await tx.user.findUnique({
                    where: { id: userId },
                    select: { balance: true }
                });

                if (!user || user.balance < dto.amount) {
                    throw new BadRequestException('Insufficient wallet balance');
                }

                // 1. Deduct Balance
                await tx.user.update({
                    where: { id: userId },
                    data: { balance: { decrement: new Prisma.Decimal(dto.amount) } }
                });

                // 2. Create Wallet Transaction
                await tx.walletTransaction.create({
                    data: {
                        userId,
                        type: 'DONATION',
                        amount: new Prisma.Decimal(dto.amount),
                        status: 'SUCCESS',
                        description: `Donate for ${campaign.title}`
                    }
                });

                // 3. Create Donation record
                const donation = await tx.donation.create({
                    data: {
                        userId,
                        campaignId: dto.campaignId,
                        amount: new Prisma.Decimal(dto.amount),
                        message: dto.message,
                        paymentMethod: 'WALLET',
                        status: 'SUCCESS',
                    },
                });

                // 4. Update Campaign Stats
                await tx.campaign.update({
                    where: { id: dto.campaignId },
                    data: {
                        currentRaisedAmount: { increment: new Prisma.Decimal(dto.amount) },
                        donationCount: { increment: 1 }
                    }
                });

                // 5. Add Ledger Entry
                await tx.campaignFundLedger.create({
                    data: {
                        campaignId: dto.campaignId,
                        donationId: donation.id,
                        amount: new Prisma.Decimal(dto.amount),
                        type: 'DONATION_IN',
                        note: `Wallet donation from ${userId}`
                    }
                });

                return {
                    donationId: donation.id,
                    status: 'SUCCESS',
                    message: 'Donated successfully using wallet'
                };
            });
        }

        // -- PAYOS DONATION --
        const donation = await (this.prisma as any).donation.create({
            data: {
                userId,
                campaignId: dto.campaignId,
                amount: new Prisma.Decimal(dto.amount),
                message: dto.message,
                paymentMethod: 'PAYOS',
                status: 'PENDING',
            },
        });

        const orderCode = Number(String(Date.now()).slice(-9));
        try {
            const body = {
                orderCode,
                amount: Number(dto.amount),
                description: `Donate ${orderCode}`,
                cancelUrl: `${this.config.get('WEB_URL')}/home/${dto.campaignId}`,
                returnUrl: `${this.config.get('WEB_URL')}/home/${dto.campaignId}?status=success`,
            };

            const paymentLink = await this.payOS.paymentRequests.create(body);
            await (this.prisma as any).paymentTransaction.create({
                data: {
                    donationId: donation.id,
                    provider: 'PAYOS',
                    status: 'PENDING',
                    orderId: String(orderCode),
                    requestId: paymentLink.paymentLinkId,
                    amount: new Prisma.Decimal(dto.amount),
                    payUrl: paymentLink.checkoutUrl,
                    qrCodeUrl: paymentLink.qrCode,
                },
            });

            return { donationId: donation.id, checkoutUrl: paymentLink.checkoutUrl };
        } catch (error: any) {
            this.logger.error(`PayOS Error: ${error.message}`);
            throw new BadRequestException('Failed to create payment link');
        }
    }

    async handleWebhook(webhookData: any) {
        const { orderCode, success, status } = webhookData;
        const transaction = await (this.prisma as any).paymentTransaction.findUnique({
            where: { orderId: String(orderCode) },
            include: { donation: { include: { campaign: true } } }
        });

        if (!transaction || transaction.status !== 'PENDING') return;

        if (success && status === 'PAID') {
            await (this.prisma as any).$transaction(async (tx: any) => {
                await tx.paymentTransaction.update({
                    where: { id: transaction.id },
                    data: { status: 'SUCCESS', paidAt: new Date() }
                });
                await tx.donation.update({
                    where: { id: transaction.donationId },
                    data: { status: 'SUCCESS', donatedAt: new Date() }
                });
                await tx.campaign.update({
                    where: { id: transaction.donation.campaignId },
                    data: {
                        currentRaisedAmount: { increment: transaction.amount },
                        donationCount: { increment: 1 }
                    }
                });
                await tx.campaignFundLedger.create({
                    data: {
                        campaignId: transaction.donation.campaignId,
                        donationId: transaction.donationId,
                        amount: transaction.amount,
                        type: 'DONATION_IN',
                        note: `PayOS donation from ${transaction.donation.userId || 'Guest'}`
                    }
                });
            });
        } else if (status === 'CANCELED' || status === 'EXPIRED') {
            await (this.prisma as any).$transaction([
                (this.prisma as any).paymentTransaction.update({
                    where: { id: transaction.id },
                    data: { status: 'CANCELLED' }
                }),
                (this.prisma as any).donation.update({
                    where: { id: transaction.donationId },
                    data: { status: 'CANCELLED' }
                })
            ]);
        }
    }

    async createBlockchainDonation(userId: string | null, dto: { campaignId: string, amount: number, txHash: string, walletAddress: string }) {
        this.logger.log(`Blockchain donation: Campaign ${dto.campaignId}, Amount ${dto.amount}, Hash ${dto.txHash}`);

        return await (this.prisma as any).$transaction(async (tx: any) => {
            const donation = await tx.donation.create({
                data: {
                    userId,
                    campaignId: dto.campaignId,
                    amount: new Prisma.Decimal(dto.amount),
                    message: `Blockchain tx: ${dto.txHash.slice(0, 8)}...`,
                    paymentMethod: 'BLOCKCHAIN',
                    status: 'SUCCESS',
                    donatedAt: new Date()
                }
            });

            await tx.campaign.update({
                where: { id: dto.campaignId },
                data: {
                    currentRaisedAmount: { increment: new Prisma.Decimal(dto.amount) },
                    donationCount: { increment: 1 }
                }
            });

            await tx.campaignFundLedger.create({
                data: {
                    campaignId: dto.campaignId,
                    donationId: donation.id,
                    amount: new Prisma.Decimal(dto.amount),
                    type: 'DONATION_IN',
                    note: `Blockchain payment by ${dto.walletAddress}`
                }
            });

            return donation;
        });
    }

    async checkStatus(orderId: string) {
        return this.payOS.paymentRequests.get(Number(orderId));
    }
}
