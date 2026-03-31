import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';
import { Prisma } from '@prisma/client';
import { TopUpDto } from './dto/top-up.dto';

@Injectable()
export class WalletService {
    private readonly logger = new Logger(WalletService.name);
    private payOS: PayOS;

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
    ) {
        this.payOS = new PayOS({
            clientId: this.config.get<string>('PAYOS_CLIENT_ID')?.trim() || 'fake',
            apiKey: this.config.get<string>('PAYOS_API_KEY')?.trim() || 'fake',
            checksumKey: this.config.get<string>('PAYOS_CHECKSUM_KEY')?.trim() || 'fake'
        });
    }

    async getBalance(userId: string) {
        const user = await (this.prisma as any).user.findUnique({
            where: { id: userId },
            include: { wallet: true }
        });
        return { balance: user?.wallet?.balance || 0 };
    }

    async getTransactions(userId: string) {
        return (this.prisma as any).walletTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
    }

    async createTopUp(userId: string, dto: TopUpDto) {
        const orderCode = Number(String(Date.now()).slice(-9));

        // 1. Create Pending Transaction
        const transaction = await (this.prisma as any).walletTransaction.create({
            data: {
                userId,
                type: 'TOPUP',
                amount: new Prisma.Decimal(dto.amount),
                status: 'PENDING',
                orderId: String(orderCode),
                description: `Top up wallet ${orderCode}`
            }
        });

        // 2. Create PayOS Link
        try {
            const body = {
                orderCode,
                amount: dto.amount,
                description: `Topup ${orderCode}`,
                cancelUrl: `${this.config.get('WEB_URL')}/wallet`,
                returnUrl: `${this.config.get('WEB_URL')}/wallet?status=success`,
            };

            const paymentLink = await this.payOS.paymentRequests.create(body);

            return {
                transactionId: transaction.id,
                checkoutUrl: paymentLink.checkoutUrl
            };
        } catch (error: any) {
            this.logger.error(`PayOS Topup Error: ${error.message}`, error.stack);
            throw new BadRequestException('Failed to create top-up link: ' + error.message);
        }
    }

    async handleWebhook(webhookData: any) {
        const { orderCode, status } = webhookData;

        if (status === 'PAID') {
            await (this.prisma as any).$transaction(async (tx) => {
                const walletTx = await tx.walletTransaction.findUnique({
                    where: { orderId: String(orderCode) }
                });

                if (walletTx && walletTx.status === 'PENDING') {
                    // Update Transaction
                    await tx.walletTransaction.update({
                        where: { id: walletTx.id },
                        data: { status: 'SUCCESS' }
                    });

                    // Update User Balance (Normalized 3NF)
                    await tx.userWallet.update({
                        where: { userId: walletTx.userId },
                        data: {
                            balance: { increment: walletTx.amount }
                        }
                    });

                    this.logger.log(`Wallet topped up for user ${walletTx.userId}: +${walletTx.amount}`);
                }
            });
        }
    }
}
