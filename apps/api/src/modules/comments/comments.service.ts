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

        const commenterName = comment.user.profile?.firstName
            ? `${comment.user.profile.firstName} ${comment.user.profile.lastName || ''}`.trim()
            : comment.user.username;

        // 1. Notify parent comment author if it's a reply
        if (dto.parentId) {
            const parentComment = await this.prisma.comment.findUnique({
                where: { id: dto.parentId },
                select: { userId: true }
            });

            if (parentComment && parentComment.userId !== userId) {
                const link = parentComment.userId === comment.campaign.creatorUserId
                    ? `/creator/campaigns/${dto.campaignId}#discussion`
                    : `/home/${dto.campaignId}#discussion`;

                await this.notificationsService.create({
                    userId: parentComment.userId,
                    title: 'New Reply',
                    message: `${commenterName} replied to your comment in "${comment.campaign.title}"`,
                    type: 'COMMENT',
                    link,
                });
            }
        }

        // 2. Notify campaign owner if not the same user AND not already notified as parent author
        const parentAuthorId = dto.parentId ? (await this.prisma.comment.findUnique({ where: { id: dto.parentId }, select: { userId: true } }))?.userId : null;

        if (comment.campaign.creatorUserId !== userId && comment.campaign.creatorUserId !== parentAuthorId) {
            await this.notificationsService.create({
                userId: comment.campaign.creatorUserId,
                title: 'New Comment',
                message: `${commenterName} commented on your campaign "${comment.campaign.title}"`,
                type: 'COMMENT',
                link: `/creator/campaigns/${dto.campaignId}#discussion`,
            });
        }

        return comment;
    }

    async findAllByCampaign(campaignId: string) {
        const allComments = await this.prisma.comment.findMany({
            where: {
                campaignId,
            },
            orderBy: { createdAt: 'asc' },
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
                    // Only add reply if it's not deleted OR it has potential children (allComments includes them)
                    // Actually, we add all first, then prune.
                    root.replies.push(c);
                } else if (!root) {
                    // If parent is missing (shouldn't happen with full load), treat as root
                    rootComments.push(c);
                }
            } else {
                rootComments.push(c);
            }
        });

        // Filter: If a comment is deleted and has no (non-deleted) replies, we can hide it.
        // But for simplicity in this 2-level tree:
        const processedRoot = rootComments.filter(r => {
            // Keep if not deleted
            if (!r.deletedAt) return true;
            // Keep if it has at least one non-deleted reply
            const hasActiveReplies = r.replies.some((reply: any) => !reply.deletedAt);
            return hasActiveReplies;
        });

        // Prune deleted replies that have no further purpose? 
        // Our UI only shows 2 levels anyway.
        processedRoot.forEach(r => {
            r.replies = r.replies.filter((reply: any) => {
                if (!reply.deletedAt) return true;
                return false; // In 2-level, a deleted reply has no children to show
            });
        });

        // Sort root comments new to old
        processedRoot.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        // Sort replies old to new
        processedRoot.forEach(r => {
            r.replies.sort((a: any, b: any) => a.createdAt.getTime() - b.createdAt.getTime());
        });

        return processedRoot;
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
