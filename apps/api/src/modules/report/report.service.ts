import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportStatus } from '@prisma/client';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';

@Injectable()
export class ReportService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Lấy tất cả báo cáo kèm thông tin submitter, targetUser, targetCampaign, targetComment.
     * Hỗ trợ filter theo status và targetType (campaign / comment).
     */
    async findAll(filters?: { status?: ReportStatus; targetType?: 'campaign' | 'comment' }) {
        const where: any = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.targetType === 'campaign') {
            where.targetCampaignId = { not: null };
            where.targetCommentId = null;
        } else if (filters?.targetType === 'comment') {
            where.targetCommentId = { not: null };
        }

        const reports = await this.prisma.report.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                submitter: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                        profile: {
                            select: { firstName: true, lastName: true, avatarUrl: true },
                        },
                    },
                },
                targetUser: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                        profile: {
                            select: { firstName: true, lastName: true, avatarUrl: true },
                        },
                        security: {
                            select: { isLocked: true, lockReason: true },
                        },
                    },
                },
                targetCampaign: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                    },
                },
                targetComment: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                    },
                },
            },
        });

        // Transform dữ liệu cho phù hợp frontend
        return reports.map((report) => {
            const submitterProfile = report.submitter.profile;
            const submitterName = submitterProfile?.firstName
                ? `${submitterProfile.firstName} ${submitterProfile.lastName || ''}`.trim()
                : report.submitter.username;

            const targetUserProfile = report.targetUser?.profile;
            const targetUserName = targetUserProfile?.firstName
                ? `${targetUserProfile.firstName} ${targetUserProfile.lastName || ''}`.trim()
                : report.targetUser?.username || 'N/A';

            const targetType = report.targetCommentId ? 'Comment' : 'Campaign';
            const targetName = report.targetCommentId
                ? report.targetComment?.content?.substring(0, 50) || 'Bình luận'
                : report.targetCampaign?.title || 'N/A';

            return {
                id: report.id,
                submitterName,
                submitterEmail: report.submitter.email,
                targetType,
                targetName,
                reason: report.reason,
                details: report.details,
                status: report.status,
                createdAt: report.createdAt,
                resolvedAt: report.resolvedAt,
                resolvedById: report.resolvedById,
                reportedUser: {
                    id: report.targetUser?.id || '',
                    name: targetUserName,
                    email: report.targetUser?.email || '',
                    role: report.targetUser?.role || 'USER',
                    avatarUrl: targetUserProfile?.avatarUrl || null,
                    isLocked: report.targetUser?.security?.isLocked || false,
                    lockReason: report.targetUser?.security?.lockReason || null,
                },
                // Thông tin gốc để frontend có thể link tới campaign/comment
                targetCampaignId: report.targetCampaignId,
                targetCommentId: report.targetCommentId,
            };
        });
    }

    /**
     * Lấy chi tiết 1 báo cáo theo ID.
     */
    async findOne(id: string) {
        const report = await this.prisma.report.findUnique({
            where: { id },
            include: {
                submitter: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                        profile: {
                            select: { firstName: true, lastName: true, avatarUrl: true },
                        },
                    },
                },
                targetUser: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                        profile: {
                            select: { firstName: true, lastName: true, avatarUrl: true },
                        },
                        security: {
                            select: { isLocked: true, lockReason: true },
                        },
                    },
                },
                targetCampaign: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        coverImageUrl: true,
                        description: true,
                    },
                },
                targetComment: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        campaign: {
                            select: { id: true, title: true },
                        },
                    },
                },
            },
        });

        if (!report) {
            throw new NotFoundException('Báo cáo không tồn tại');
        }

        return report;
    }

    /**
     * Cập nhật trạng thái báo cáo (RESOLVED / DISMISSED).
     * Chỉ super admin mới được gọi endpoint này.
     */
    async updateStatus(id: string, dto: UpdateReportStatusDto, adminId: string) {
        const report = await this.prisma.report.findUnique({ where: { id } });

        if (!report) {
            throw new NotFoundException('Báo cáo không tồn tại');
        }

        const data: any = {
            status: dto.status,
        };

        // Nếu resolve hoặc dismiss thì ghi thông tin admin xử lý
        if (dto.status === ReportStatus.RESOLVED || dto.status === ReportStatus.DISMISSED) {
            data.resolvedAt = new Date();
            data.resolvedById = adminId;
        }

        return this.prisma.report.update({
            where: { id },
            data,
        });
    }

    /**
     * Lấy thống kê báo cáo.
     */
    async getStats() {
        const [total, pending, resolved, dismissed] = await Promise.all([
            this.prisma.report.count(),
            this.prisma.report.count({ where: { status: ReportStatus.PENDING } }),
            this.prisma.report.count({ where: { status: ReportStatus.RESOLVED } }),
            this.prisma.report.count({ where: { status: ReportStatus.DISMISSED } }),
        ]);

        return { total, pending, resolved, dismissed };
    }
}
