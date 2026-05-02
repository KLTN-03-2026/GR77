import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';
import { Prisma } from '@prisma/client';
import { TopUpDto } from './dto/top-up.dto';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';

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

        // Ensure wallet exists
        if (!user.wallet) {
            await (this.prisma as any).userWallet.create({
                data: { userId, balance: 0 }
            });
            return { balance: 0 };
        }

        return { balance: user?.wallet?.balance || 0 };
    }

    async getNonce(userId: string) {
        const nonce = `Kindlink Verification Nonce: ${uuidv4()}`;

        await (this.prisma as any).userWallet.upsert({
            where: { userId },
            update: { nonce },
            create: { userId, nonce, balance: 0 }
        });

        return { nonce };
    }

    async linkWallet(userId: string, address: string, signature: string) {
        const wallet = await (this.prisma as any).userWallet.findUnique({
            where: { userId }
        });

        if (!wallet || !wallet.nonce) {
            throw new BadRequestException('Nonce expired or not found. Please request a new nonce.');
        }

        this.logger.log(`[LinkWallet] === START ===`);
        this.logger.log(`[LinkWallet] userId: ${userId}`);
        this.logger.log(`[LinkWallet] address type: ${typeof address}, value: "${address}"`);
        this.logger.log(`[LinkWallet] signature type: ${typeof signature}, value: "${signature?.substring(0, 20)}..."`);
        this.logger.log(`[LinkWallet] nonce type: ${typeof wallet.nonce}, value: "${wallet.nonce}"`);

        if (!address || !signature) {
            this.logger.error(`[LinkWallet] Missing address or signature!`);
            throw new BadRequestException('Address and signature are required');
        }

        try {
            const recoveredAddress = ethers.verifyMessage(wallet.nonce, signature);
            this.logger.log(`[LinkWallet] Recovered address: ${recoveredAddress}`);

            if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
                this.logger.error(`[LinkWallet] Address mismatch! Recovered: ${recoveredAddress}, Expected: ${address}`);
                throw new BadRequestException('Signature verification failed: address mismatch');
            }

            // Check if this wallet address is already linked to another user
            const existingWallet = await (this.prisma as any).userWallet.findFirst({
                where: { walletAddress: address }
            });

            if (existingWallet && existingWallet.userId !== userId) {
                throw new BadRequestException('Địa chỉ ví này đã được liên kết với tài khoản khác.');
            }

            // Update wallet address and clear nonce
            await (this.prisma as any).userWallet.update({
                where: { userId },
                data: {
                    walletAddress: address,
                    nonce: null
                }
            });

            this.logger.log(`[LinkWallet] === SUCCESS ===`);
            return { success: true, walletAddress: address };
        } catch (error: any) {
            this.logger.error(`[LinkWallet] Error: ${error.message}`);
            if (error instanceof BadRequestException) throw error;
            throw new BadRequestException('Invalid signature or verification failed');
        }
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
            const webUrl = this.config.get('WEB_URL') || 'http://localhost:3000';
            const body = {
                orderCode,
                amount: dto.amount,
                description: `Topup ${orderCode}`,
                cancelUrl: `${webUrl}/wallet`,
                returnUrl: `${webUrl}/wallet?status=success`,
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
