import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * ParticipantsService
 *
 * Business logic cho việc tham gia / rời khỏi campaigns
 *
 * Endpoints:
 * - POST   /participants          → join campaign
 * - DELETE /participants/:id      → leave campaign
 * - GET    /participants/me       → danh sách campaigns tôi đã join
 * - GET    /participants/:id/status → kiểm tra tôi đã join campaign chưa
 */
@Injectable()
export class ParticipantsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService
    ) { }

    // ─── Helper: campaign select shape ───────────────────────────────────────
    private campaignSelect = {
        id: true,
        title: true,
        category: true,
        locationText: true,
        coverImageUrl: true,
        fundingGoalAmount: true,
        currentRaisedAmount: true,
        minimumDonationAmount: true,
        startAt: true,
        endAt: true,
        status: true,
        description: true,
        createdAt: true,
    };

    // ─── join() ──────────────────────────────────────────────────────────────
    /**
     * Tham gia một campaign.
     *
     * - Idempotent: nếu đã JOINED → trả { joined: true } thay vì lỗi
     * - Nếu đã LEFT trước đó → cập nhật lại status = JOINED
     * - Chỉ cho phép join campaign có status ACTIVE
     */
    async join(userId: string, campaignId: string) {
        // 1. Kiểm tra campaign tồn tại & đang ACTIVE
        const campaign = await (this.prisma as any).campaign.findUnique({
            where: { id: campaignId },
            select: { id: true, status: true, creatorUserId: true },
        });
        if (!campaign) throw new NotFoundException('Campaign not found');
        if (campaign.creatorUserId === userId) {
            throw new BadRequestException('Bạn không thể tham gia chiến dịch do chính mình tổ chức');
        }
        if (campaign.status !== 'ACTIVE') {
            throw new BadRequestException('Campaign is not active');
        }

        // 2. Kiểm tra đã tham gia chưa
        const existing = await (this.prisma as any).campaignParticipant.findUnique({
            where: { userId_campaignId: { userId, campaignId } },
        });

        if (existing) {
            if (existing.status === 'JOINED') {
                // Đã join rồi → idempotent
                return { joined: true, alreadyJoined: true };
            }
            // Đã LEFT → join lại
            const updated = await (this.prisma as any).campaignParticipant.update({
                where: { id: existing.id },
                data: { status: 'JOINED', joinedAt: new Date(), leftAt: null },
            });

            await this.notificationsService.create({
                userId: campaign.creatorUserId,
                title: 'New Supporter Joined',
                message: `A supporter has rejoined your campaign: ${campaign.title}`,
                type: 'CAMPAIGN_UPDATE',
                link: `/creator/campaigns/${campaign.id}`
            });

            return { joined: true, participant: updated };
        }

        // 3. Tạo mới participation record
        const participant = await (this.prisma as any).campaignParticipant.create({
            data: { userId, campaignId, status: 'JOINED' },
        });

        await this.notificationsService.create({
            userId: campaign.creatorUserId,
            title: 'New Supporter Joined',
            message: `A new member just joined your campaign: ${campaign.title}`,
            type: 'CAMPAIGN_UPDATE',
            link: `/creator/campaigns/${campaign.id}`
        });

        return { joined: true, participant };
    }

    // ─── leave() ─────────────────────────────────────────────────────────────
    /**
     * Rời khỏi một campaign.
     * - Cập nhật status = LEFT, leftAt = now()
     * - Idempotent: nếu chưa join hoặc đã left → trả { left: true }
     */
    async leave(userId: string, campaignId: string) {
        const existing = await (this.prisma as any).campaignParticipant.findUnique({
            where: { userId_campaignId: { userId, campaignId } },
        });

        if (!existing || existing.status === 'LEFT') {
            return { left: true, alreadyLeft: true };
        }

        // --- CHECK DONATION ---
        const donation = await (this.prisma as any).donation.findFirst({
            where: {
                userId,
                campaignId,
                status: 'SUCCESS',
            },
        });

        if (donation) {
            throw new BadRequestException('Bạn không thể rời khỏi chiến dịch vì đã thực hiện quyên góp thành công.');
        }

        await (this.prisma as any).campaignParticipant.update({
            where: { id: existing.id },
            data: { status: 'LEFT', leftAt: new Date() },
        });

        return { left: true };
    }

    // ─── listMine() ───────────────────────────────────────────────────────────
    /**
     * Danh sách campaigns mà user đang JOINED (status = JOINED).
     * Paginated, sắp xếp mới nhất trước.
     */
    async listMine(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [total, participants] = await (this.prisma as any).$transaction([
            (this.prisma as any).campaignParticipant.count({
                where: {
                    userId,
                    status: 'JOINED',
                    campaign: { creatorUserId: { not: userId } }
                },
            }),
            (this.prisma as any).campaignParticipant.findMany({
                where: {
                    userId,
                    status: 'JOINED',
                    campaign: { creatorUserId: { not: userId } }
                },
                orderBy: { joinedAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    joinedAt: true,
                    campaign: { select: this.campaignSelect },
                },
            }),
        ]);

        return {
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
            items: participants.map((p: any) => ({
                ...p.campaign,
                joinedAt: p.joinedAt,
                participantId: p.id,
            })),
        };
    }

    // ─── getStatus() ──────────────────────────────────────────────────────────
    /**
     * Kiểm tra user đã join campaign chưa.
     * Response: { joined: boolean, joinedAt?: Date }
     */
    async getStatus(userId: string, campaignId: string) {
        const record = await (this.prisma as any).campaignParticipant.findUnique({
            where: { userId_campaignId: { userId, campaignId } },
            select: { status: true, joinedAt: true },
        });

        const joined = record?.status === 'JOINED';

        // Check if user has donated
        const donation = await (this.prisma as any).donation.findFirst({
            where: {
                userId,
                campaignId,
                status: 'SUCCESS',
            },
        });

        return {
            joined,
            joinedAt: joined ? record.joinedAt : null,
            hasDonated: !!donation,
        };
    }
}
