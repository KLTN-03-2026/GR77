import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ReportCommentDto } from './dto/report-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsService: NotificationsService
    ) { }

    async create(userId: string, dto: CreateCommentDto) {
        const comment = await this.prisma.comment.create({
            data: {
                userId,
                campaignId: dto.campaignId,
                content: dto.content,
                parentId: dto.parentId || null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        profile: {
                            select: { avatarUrl: true, firstName: true, lastName: true }
                        }
                    }
                },
                campaign: {
                    select: {
                        creatorUserId: true,
                        title: true
                    }
                }
            }
        });

        // Notify campaign owner if not the same user
        if (comment.campaign.creatorUserId !== userId) {
            const commenterName = comment.user.profile?.firstName
                ? `${comment.user.profile.firstName} ${comment.user.profile.lastName || ''}`.trim()
                : comment.user.username;

            await this.notificationsService.create({
                userId: comment.campaign.creatorUserId,
                title: 'Bình luận mới',
                message: `${commenterName} đã bình luận vào chiến dịch "${comment.campaign.title}"`,
                type: 'COMMENT',
                link: `/home/${dto.campaignId}`,
            });
        }

        return comment;
    }

    async findAllByCampaign(campaignId: string) {
        return this.prisma.comment.findMany({
            where: {
                campaignId,
                parentId: null, // Get top-level comments
                deletedAt: null,
            },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        profile: {
                            select: { avatarUrl: true, firstName: true, lastName: true }
                        }
                    }
                },
                replies: {
                    where: { deletedAt: null },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                profile: {
                                    select: { avatarUrl: true, firstName: true, lastName: true }
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    async remove(userId: string, commentId: string) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        if (comment.userId !== userId) {
            throw new ForbiddenException('You can only delete your own comments');
        }

        // Soft delete
        return this.prisma.comment.update({
            where: { id: commentId },
            data: {
                deletedAt: new Date(),
                content: '[Comment deleted]'
            }
        });
    }

    async report(userId: string, commentId: string, dto: ReportCommentDto) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        return this.prisma.report.create({
            data: {
                submitterId: userId,
                targetCommentId: commentId,
                targetUserId: comment.userId,
                targetCampaignId: comment.campaignId,
                reason: dto.reason,
                details: dto.details
            }
        });
    }
}
