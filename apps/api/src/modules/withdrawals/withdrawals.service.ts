import {
    Injectable,
    ForbiddenException,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { ApproveWithdrawalDto } from './dto/approve-withdrawal.dto';
import { RejectWithdrawalDto } from './dto/reject-withdrawal.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { AdminPermission } from '../../constants/permissions';

@Injectable()
export class WithdrawalsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService,
    ) { }

    // ─────────────────────────────────────────────────────────────────────────
    // CREATOR: Tạo yêu cầu rút tiền
    // ─────────────────────────────────────────────────────────────────────────
    async createRequest(userId: string, campaignId: string, dto: CreateWithdrawalDto) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: {
                creatorUser: { include: { wallet: true } },
                withdrawalRequests: {
                    where: { status: { in: ['PENDING', 'APPROVED'] } },
                },
            },
        });

        if (!campaign) throw new NotFoundException('Campaign not found');
        if (campaign.creatorUserId !== userId) {
            throw new ForbiddenException('Only the campaign creator can request withdrawals');
        }
        if (campaign.status !== 'ACTIVE' && campaign.status !== 'COMPLETED') {
            throw new BadRequestException('Withdrawals can only be requested for ACTIVE or COMPLETED campaigns');
        }

        // Tính số tiền đã rút hoặc đang chờ duyệt
        const totalWithdrawnOrPending = campaign.withdrawalRequests.reduce(
            (acc, req) => acc + Number(req.amount),
            0,
        );

        const availableBalance = Number(campaign.currentRaisedAmount) - totalWithdrawnOrPending;

        if (dto.amount <= 0) {
            throw new BadRequestException('Withdrawal amount must be greater than 0');
        }

        if (dto.amount > availableBalance) {
            throw new BadRequestException(
                `Số tiền vượt quá số dư khả dụng. Tối đa có thể rút: ${availableBalance.toLocaleString('vi-VN')} VNĐ`,
            );
        }

        // Kiểm tra ví nếu rút qua Blockchain
        let walletAddress: string | null = null;
        if (dto.method === 'WALLET') {
            walletAddress = campaign.creatorUser?.wallet?.walletAddress ?? null;
            if (!walletAddress) {
                throw new BadRequestException('Vui lòng liên kết ví trên trang Wallet trước khi rút qua Blockchain');
            }
        }

        // Validate Bank info
        if (dto.method === 'BANK') {
            if (!dto.bankName || !dto.accountNumber || !dto.accountOwner) {
                throw new BadRequestException('Vui lòng nhập đầy đủ thông tin ngân hàng');
            }
        }

        const request = await this.prisma.withdrawalRequest.create({
            data: {
                campaignId,
                amount: dto.amount,
                reason: dto.reason,
                method: dto.method,
                bankName: dto.bankName,
                accountNumber: dto.accountNumber,
                accountOwner: dto.accountOwner,
                walletAddress,
                status: 'PENDING',
            },
        });

        // Notify Admin
        await this.notificationsService.notifyAdmins(
            {
                title: '💸 Yêu cầu rút tiền mới',
                message: `Chiến dịch "${campaign.title}" yêu cầu rút ${Number(dto.amount).toLocaleString('vi-VN')} VNĐ.`,
                type: 'WITHDRAWAL_REQUESTED',
                link: `/admin/withdrawals?highlight=${request.id}`,
            },
            AdminPermission.WITHDRAWALS_APPROVE,
        );

        return request;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CREATOR: Xem danh sách yêu cầu rút tiền của campaign
    // ─────────────────────────────────────────────────────────────────────────
    async listForCampaign(userId: string, campaignId: string) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign || campaign.creatorUserId !== userId) {
            throw new ForbiddenException('You can only view withdrawals for your own campaigns');
        }

        return this.prisma.withdrawalRequest.findMany({
            where: { campaignId },
            orderBy: { createdAt: 'desc' },
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN: Lấy tất cả yêu cầu rút tiền (có filter theo status)
    // ─────────────────────────────────────────────────────────────────────────
    async adminListAll(status?: string) {
        const where: any = {};
        if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
            where.status = status.toUpperCase();
        }

        const requests = await this.prisma.withdrawalRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                campaign: {
                    select: {
                        id: true,
                        title: true,
                        currentRaisedAmount: true,
                        status: true,
                        creatorUser: {
                            select: {
                                id: true,
                                email: true,
                                username: true,
                                profile: {
                                    select: { firstName: true, lastName: true, avatarUrl: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        return requests;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN: Phê duyệt yêu cầu rút tiền
    // ─────────────────────────────────────────────────────────────────────────
    async approve(adminId: string, requestId: string, dto: ApproveWithdrawalDto) {
        const request = await this.prisma.withdrawalRequest.findUnique({
            where: { id: requestId },
            include: {
                campaign: {
                    include: { creatorUser: true },
                },
            },
        });

        if (!request) throw new NotFoundException('Withdrawal request not found');
        if (request.status !== 'PENDING') {
            throw new BadRequestException(`Cannot approve a request with status: ${request.status}`);
        }

        const updated = await this.prisma.withdrawalRequest.update({
            where: { id: requestId },
            data: {
                status: 'APPROVED',
                txHash: dto.txHash ?? null,
            },
        });

        // Notify creator
        const creatorId = request.campaign.creatorUserId;
        const amount = Number(request.amount).toLocaleString('vi-VN');
        await this.notificationsService.create({
            userId: creatorId,
            title: '✅ Yêu cầu rút tiền được chấp nhận',
            message: `Yêu cầu rút ${amount} VNĐ từ chiến dịch "${request.campaign.title}" đã được phê duyệt.${dto.txHash ? ` Mã giao dịch: ${dto.txHash}` : ''}`,
            type: 'WITHDRAWAL_APPROVED',
            link: `/creator/campaigns/${request.campaign.id}`,
        });

        return updated;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN: Từ chối yêu cầu rút tiền
    // ─────────────────────────────────────────────────────────────────────────
    async reject(adminId: string, requestId: string, dto: RejectWithdrawalDto) {
        const request = await this.prisma.withdrawalRequest.findUnique({
            where: { id: requestId },
            include: {
                campaign: {
                    include: { creatorUser: true },
                },
            },
        });

        if (!request) throw new NotFoundException('Withdrawal request not found');
        if (request.status !== 'PENDING') {
            throw new BadRequestException(`Cannot reject a request with status: ${request.status}`);
        }

        const updated = await this.prisma.withdrawalRequest.update({
            where: { id: requestId },
            data: { status: 'REJECTED' },
        });

        // Notify creator
        const creatorId = request.campaign.creatorUserId;
        const amount = Number(request.amount).toLocaleString('vi-VN');
        await this.notificationsService.create({
            userId: creatorId,
            title: '❌ Yêu cầu rút tiền bị từ chối',
            message: `Yêu cầu rút ${amount} VNĐ từ chiến dịch "${request.campaign.title}" đã bị từ chối. Lý do: ${dto.reason || 'Không có lý do cụ thể'}`,
            type: 'WITHDRAWAL_REJECTED',
            link: `/creator/campaigns/${request.campaign.id}`,
        });

        return updated;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Lấy chi tiết một yêu cầu
    // ─────────────────────────────────────────────────────────────────────────
    async findOne(requestId: string) {
        const request = await this.prisma.withdrawalRequest.findUnique({
            where: { id: requestId },
            include: {
                campaign: {
                    select: {
                        id: true,
                        title: true,
                        currentRaisedAmount: true,
                        creatorUser: {
                            select: {
                                id: true,
                                email: true,
                                username: true,
                                profile: {
                                    select: { firstName: true, lastName: true, avatarUrl: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!request) throw new NotFoundException('Withdrawal request not found');
        return request;
    }
}
