import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { AdminPermission } from '../../constants/permissions';

@Injectable()
export class WithdrawalsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService,
    ) { }

    async createRequest(userId: string, campaignId: string, dto: CreateWithdrawalDto) {
        const campaign = await (this.prisma as any).campaign.findUnique({
            where: { id: campaignId },
            include: {
                creatorUser: { include: { wallet: true } },
                withdrawalRequests: {
                    where: { status: { in: ['PENDING', 'APPROVED'] } }
                }
            }
        });

        if (!campaign) {
            throw new BadRequestException('Campaign not found');
        }

        if (campaign.creatorUserId !== userId) {
            throw new ForbiddenException('Only the campaign creator can request withdrawals');
        }

        // Calculate sum of existing requests
        const totalWithdrawnOrPending = (campaign.withdrawalRequests as any[]).reduce(
            (acc, req) => acc + Number(req.amount),
            0
        );

        const availableBalance = Number(campaign.currentRaisedAmount) - totalWithdrawnOrPending;

        if (dto.amount > availableBalance) {
            throw new BadRequestException(`Amount exceeds available balance. Max withdrawable: ${availableBalance.toLocaleString()} VNĐ`);
        }

        let walletAddress: string | null = null;
        if (dto.method === 'WALLET') {
            walletAddress = (campaign as any).creatorUser?.wallet?.walletAddress;
            if (!walletAddress) {
                throw new BadRequestException('Please link your wallet in settings first');
            }
        }

        const request = await (this.prisma as any).withdrawalRequest.create({
            data: {
                campaignId,
                amount: dto.amount,
                reason: dto.reason,
                method: dto.method,
                bankName: dto.bankName,
                accountNumber: dto.accountNumber,
                accountOwner: dto.accountOwner,
                walletAddress,
                status: 'PENDING'
            }
        });

        // Notify Admins
        await this.notificationsService.notifyAdmins({
            title: 'New Withdrawal Request',
            message: `Campaign "${campaign.title}" requested a withdrawal of ${dto.amount.toLocaleString()} VNĐ.`,
            type: 'WITHDRAWAL_REQUESTED',
            link: `/admin/withdrawals?id=${request.id}`
        }, AdminPermission.WITHDRAWALS_APPROVE);

        return request;
    }

    async listForCampaign(userId: string, campaignId: string) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId }
        });

        if (!campaign || (campaign.creatorUserId !== userId)) {
            throw new ForbiddenException('You can only view withdrawals for your own campaign');
        }

        return (this.prisma as any).withdrawalRequest.findMany({
            where: { campaignId },
            orderBy: { createdAt: 'desc' }
        });
    }
}
