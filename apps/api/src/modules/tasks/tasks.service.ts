import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService,
    ) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleCampaignAutoClose() {
        this.logger.debug('Running handleCampaignAutoClose check...');
        const now = new Date();

        // Find campaigns that should be closed but are still ACTIVE
        // 1. Expired by endAt
        // 2. Goal reached and autoCloseWhenGoalReached is true
        const campaignsToClose = await this.prisma.campaign.findMany({
            where: {
                status: 'ACTIVE',
                OR: [
                    { endAt: { lt: now } },
                    {
                        autoCloseWhenGoalReached: true,
                        currentRaisedAmount: {
                            gte: this.prisma.campaign.fields.fundingGoalAmount,
                        },
                    },
                ],
            },
            include: {
                participants: {
                    select: {
                        userId: true,
                    },
                },
            },
        });

        if (campaignsToClose.length === 0) {
            return;
        }

        this.logger.log(`Found ${campaignsToClose.length} campaigns to close.`);

        for (const campaign of campaignsToClose) {
            try {
                // Determine if it was successful based on goal
                const isSuccess = Number(campaign.currentRaisedAmount) >= Number(campaign.fundingGoalAmount);
                const newStatus = 'COMPLETED' as any; // Cast to bypass strict enum if needed, but COMPLETED exists

                // Update status in DB
                await this.prisma.campaign.update({
                    where: { id: campaign.id },
                    data: { status: newStatus },
                });

                // 1. Notify Creator
                await this.notificationsService.create({
                    userId: campaign.creatorUserId,
                    title: 'Chiến dịch đã kết thúc',
                    message: `Chiến dịch "${campaign.title}" của bạn đã kết thúc với trạng thái: ${isSuccess ? 'THÀNH CÔNG' : 'KHÔNG ĐẠT MỤC TIÊU'}.`,
                    type: 'CAMPAIGN_CLOSED',
                    link: `/home/${campaign.id}`,
                });

                // 2. Notify all participants
                const participantIds = campaign.participants.map(p => p.userId);

                // Batch create notifications for participants
                await Promise.all(
                    participantIds.map(userId =>
                        this.notificationsService.create({
                            userId,
                            title: 'Chiến dịch kết thúc',
                            message: `Chiến dịch "${campaign.title}" mà bạn tham gia đã chính thức kết thúc. Cảm ơn sự đồng hành của bạn!`,
                            type: 'CAMPAIGN_CLOSED_PARTICIPANT',
                            link: `/home/${campaign.id}`,
                        })
                    )
                );

                this.logger.log(`Closed campaign ${campaign.id} and notified ${participantIds.length + 1} users.`);
            } catch (error) {
                this.logger.error(`Failed to close campaign ${campaign.id}: ${error.message}`);
            }
        }
    }
}
