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
        const allComments = await this.prisma.comment.findMany({
            where: {
                campaignId,
                deletedAt: null,
            },
            orderBy: { createdAt: 'asc' }, // sort by time ascending so we can process replies in order
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
        });

        const commentMap = new Map();
        const rootComments: any[] = [];

        allComments.forEach(c => {
            (c as any).replies = [];
            commentMap.set(c.id, c);
        });

        // Helper to find the ultimate root
        const findRoot = (comment: any): any => {
            if (!comment.parentId) return comment;
            const parent = commentMap.get(comment.parentId);
            if (!parent) return comment;
            return findRoot(parent);
        };

        // Build flat 2-level tree
        allComments.forEach(c => {
            if (c.parentId) {
                const root = findRoot(c);
                if (root && root.id !== c.id) {
                    root.replies.push(c);
                } else {
                    rootComments.push(c);
                }
            } else {
                rootComments.push(c);
            }
        });

        // Optional: root comments should usually be sorted new to old
        rootComments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        // We also want to sort each root's replies chronologically
        rootComments.forEach(r => {
            r.replies.sort((a: any, b: any) => a.createdAt.getTime() - b.createdAt.getTime());
        });

        return rootComments;
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
