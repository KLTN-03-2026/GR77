import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';
import { Prisma } from '@prisma/client';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class DonationsService {
    private readonly logger = new Logger(DonationsService.name);
    private payOS: PayOS;

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
        private readonly blockchainService: BlockchainService,
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
                    include: { wallet: true }
                });

                if (!user || !user.wallet || user.wallet.balance.lessThan(dto.amount)) {
                    throw new BadRequestException('Insufficient wallet balance');
                }

                // 1. Deduct Balance
                await tx.userWallet.update({
                    where: { userId: userId },
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
                        isAnonymous: false,
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
                isAnonymous: false,
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
                returnUrl: `${this.config.get('WEB_URL')}/home/${dto.campaignId}?status=success&orderCode=${orderCode}`,
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
        this.logger.log(`[Webhook] Processing data: ${JSON.stringify(webhookData)}`);

        try {
            const code = webhookData?.code;
            const success = webhookData?.success;
            const payload = webhookData?.data || webhookData;
            const orderCode = payload?.orderCode;
            const status = String(payload?.status || webhookData?.status || "").toUpperCase();

            if (!orderCode) {
                this.logger.error("[Webhook] No orderCode found in webhook data!");
                return;
            }

            this.logger.log(`[Webhook] Looking for transaction with orderId: ${orderCode}`);
            const transaction = await (this.prisma as any).paymentTransaction.findUnique({
                where: { orderId: String(orderCode) },
                include: { donation: { include: { campaign: true } } }
            });

            if (!transaction) {
                this.logger.warn(`[Webhook] Transaction not found for orderId: ${orderCode}`);
                return;
            }

            if (transaction.status !== 'PENDING') {
                this.logger.log(`[Webhook] Transaction ${orderCode} already processed (Status: ${transaction.status})`);
                return;
            }

            if (code === '00' || status === 'PAID' || success === true) {
                this.logger.log(`[Webhook] Payment SUCCESS for order ${orderCode}. Updating database...`);
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
                            currentBalance: { increment: transaction.amount },
                            donationCount: { increment: 1 }
                        }
                    });
                    await tx.campaignFundLedger.create({
                        data: {
                            campaignId: transaction.donation.campaignId,
                            donationId: transaction.donationId,
                            amount: transaction.amount,
                            type: 'DONATION_IN',
                            note: `PayOS donation sync - User ${transaction.donation.userId || 'Guest'}`
                        }
                    });

                    // 5. Create Wallet Transaction for User History
                    if (transaction.donation.userId) {
                        await tx.walletTransaction.create({
                            data: {
                                userId: transaction.donation.userId,
                                type: 'DONATION',
                                amount: transaction.amount,
                                status: 'SUCCESS',
                                description: `PayOS Donate: ${transaction.donation.campaign.title}`,
                                orderId: transaction.orderId
                            }
                        });
                    }
                });
                this.logger.log(`[Webhook] Database updated successfully for order ${orderCode}`);

                // ── Auto-deposit equivalent POL to Smart Contract ───────────
                // Fire-and-forget: SC failure MUST NOT block the payment confirmation.
                // The donor's VND payment is already recorded in DB.
                this.depositPolForBankingDonation(
                    transaction.donation.campaignId,
                    Number(transaction.amount),
                    transaction.donation.userId || 'Guest',
                );
            } else if (status === 'CANCELED' || status === 'EXPIRED') {
                this.logger.log(`[Webhook] Payment FAILED/CANCELLED for order ${orderCode}. Status: ${status}`);
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
        } catch (error) {
            this.logger.error(`[Webhook] Critical error processing order: ${error.message}`, error.stack);
        }
    }

    async createBlockchainDonation(userId: string | null, dto: { campaignId: string, amount: number, txHash: string, walletAddress: string, message?: string, isAnonymous?: boolean }) {
        this.logger.log(`Blockchain donation: Campaign ${dto.campaignId}, Amount ${dto.amount}, Hash ${dto.txHash}`);

        return await (this.prisma as any).$transaction(async (tx: any) => {
            const donation = await tx.donation.create({
                data: {
                    userId,
                    campaignId: dto.campaignId,
                    amount: new Prisma.Decimal(dto.amount),
                    message: dto.message || `Blockchain tx: ${dto.txHash.slice(0, 8)}...`,
                    isAnonymous: false,
                    paymentMethod: 'BLOCKCHAIN',
                    status: 'SUCCESS',
                    donatedAt: new Date()
                },
                include: { campaign: true }
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

            // 4. Create Wallet Transaction for User History
            if (userId) {
                await tx.walletTransaction.create({
                    data: {
                        userId,
                        type: 'DONATION',
                        amount: new Prisma.Decimal(dto.amount),
                        status: 'SUCCESS',
                        description: `Blockchain Donate: ${donation.campaign.title}`,
                        orderId: dto.txHash // Use txHash as orderId for uniqueness/reference
                    }
                });
            }

            return donation;
        });
    }

    async adminListAll(filters: { status?: string; method?: string; campaignId?: string }) {
        const where: any = {};
        if (filters.status) where.status = filters.status.toUpperCase();
        if (filters.method) where.paymentMethod = filters.method.toUpperCase();
        if (filters.campaignId) where.campaignId = filters.campaignId;

        return this.prisma.donation.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: {
                campaign: { select: { id: true, title: true } },
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
                    },
                },
            },
        });
    }

    async checkStatus(orderId: string) {
        const paymentInfo = await this.payOS.paymentRequests.get(Number(orderId));
        // this.logger.log(`[PayOS Status Check] Raw response for Order ${orderId}: ${JSON.stringify(paymentInfo, null, 2)}`);

        // If PayOS says it's PAID but our DB might still be PENDING
        if (paymentInfo.status === 'PAID') {
            await this.handleWebhook({
                code: '00',
                success: true,
                data: {
                    orderCode: orderId,
                    status: 'PAID'
                }
            });
        }

        return paymentInfo;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Fire-and-forget: deposit equivalent POL into Smart Contract after banking donation.
     * Hot-wallet calls donate(campaignKey) with POL amount = amountVND * POL_PER_VND.
     *
     * IMPORTANT: Must NEVER throw — failure here should not fail the payment flow.
     */
    private async depositPolForBankingDonation(
        campaignId: string,
        amountVND: number,
        donorLabel: string,
    ): Promise<void> {
        try {
            const result = await this.blockchainService.depositForBankingDonation(
                campaignId,
                amountVND,
                donorLabel,
            );
            this.logger.log(
                `[HotWallet] Banking donation mirrored on-chain — ` +
                `campaign: ${campaignId}, ${result.polAmount} POL, tx: ${result.txHash}`,
            );
        } catch (err: any) {
            // Non-fatal: log clearly so ops team can monitor and top-up hot wallet if needed
            this.logger.warn(
                `[HotWallet] ⚠️ Failed to mirror banking donation to SC — ` +
                `campaign: ${campaignId}, amount: ${amountVND} VND. ` +
                `Error: ${err.message}. ` +
                `The VND donation is already recorded in DB. Hot wallet may need POL top-up.`,
            );
        }
    }
}

