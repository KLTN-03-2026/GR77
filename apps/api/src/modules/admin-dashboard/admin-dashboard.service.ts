import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Returns summary stats: total users, active campaigns, total successful donations amount
     */
    async getStats() {
        const [totalUsers, activeCampaigns, donationAgg] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.campaign.count({ where: { status: 'ACTIVE' } }),
            this.prisma.donation.aggregate({
                _sum: { amount: true },
                _count: { id: true },
                where: { status: 'SUCCESS' },
            }),
        ]);

        return {
            totalUsers,
            activeCampaigns,
            totalDonationAmount: Number(donationAgg._sum.amount || 0),
            totalDonationCount: donationAgg._count.id,
        };
    }

    /**
     * Donation growth: monthly aggregation of successful donations for the last 12 months
     */
    async getDonationGrowth() {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        const donations = await this.prisma.donation.findMany({
            where: {
                status: 'SUCCESS',
                createdAt: { gte: twelveMonthsAgo },
            },
            select: {
                amount: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        // Group by month
        const monthMap = new Map<string, number>();
        const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

        // Initialize all months in range
        for (let i = 0; i < 12; i++) {
            const d = new Date(twelveMonthsAgo);
            d.setMonth(d.getMonth() + i);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            monthMap.set(key, 0);
        }

        for (const d of donations) {
            const key = `${d.createdAt.getFullYear()}-${d.createdAt.getMonth()}`;
            monthMap.set(key, (monthMap.get(key) || 0) + Number(d.amount));
        }

        const result: { month: string; value: number }[] = [];
        for (const [key, value] of monthMap) {
            const [, monthIdx] = key.split('-');
            result.push({ month: monthNames[parseInt(monthIdx)], value });
        }

        return result;
    }

    /**
     * Fund allocation: percentage of raised funds per campaign category
     */
    async getFundAllocation() {
        const categories = await this.prisma.campaignCategory.findMany({
            include: {
                campaigns: {
                    select: { currentRaisedAmount: true },
                },
            },
        });

        const COLORS = ['#F76C6C', '#7BC712', '#5DA2D5', '#FAED26', '#FF9F43', '#A855F7', '#EC4899', '#14B8A6'];

        let totalRaised = 0;
        const raw = categories.map((cat, i) => {
            const sum = cat.campaigns.reduce((acc, c) => acc + Number(c.currentRaisedAmount || 0), 0);
            totalRaised += sum;
            return { name: cat.name, value: sum, color: COLORS[i % COLORS.length] };
        });

        // Convert to percentages
        if (totalRaised === 0) {
            return raw.map((r) => ({ ...r, value: 0 }));
        }

        return raw
            .filter((r) => r.value > 0)
            .map((r) => ({
                ...r,
                value: Math.round((r.value / totalRaised) * 100),
            }));
    }

    /**
     * Activity log:
     * - filter=1 → users who registered
     * - filter=2 → users who created a campaign
     * - filter=3 → eKYC sumissions
     * - filter=undefined → all combined, sorted by date desc
     */
    async getActivityLog(filter?: string) {
        const items: {
            id: string;
            username: string;
            email: string;
            avatarUrl: string | null;
            activity: string;
            date: Date;
            type: 'REGISTER' | 'CAMPAIGN' | 'EKYC' | 'DONATION' | 'WITHDRAWAL';
        }[] = [];

        if (!filter || filter === '1') {
            const users = await this.prisma.user.findMany({
                where: { role: 'USER' },
                orderBy: { createdAt: 'desc' },
                take: 50,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    createdAt: true,
                    profile: { select: { avatarUrl: true } },
                },
            });

            for (const u of users) {
                items.push({
                    id: `reg-${u.id}`,
                    username: u.username,
                    email: u.email,
                    avatarUrl: u.profile?.avatarUrl || null,
                    activity: 'Đã đăng ký tài khoản',
                    date: u.createdAt,
                    type: 'REGISTER',
                });
            }
        }

        if (!filter || filter === '2') {
            const campaigns = await this.prisma.campaign.findMany({
                where: { creatorUser: { role: 'USER' } },
                orderBy: { createdAt: 'desc' },
                take: 50,
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    creatorUser: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            profile: { select: { avatarUrl: true } },
                        },
                    },
                },
            });

            for (const c of campaigns) {
                items.push({
                    id: `camp-${c.id}`,
                    username: c.creatorUser.username,
                    email: c.creatorUser.email,
                    avatarUrl: c.creatorUser.profile?.avatarUrl || null,
                    activity: `Đã tạo chiến dịch "${c.title}"`,
                    date: c.createdAt,
                    type: 'CAMPAIGN',
                });
            }
        }

        if (!filter || filter === '3') {
            const ekycs = await this.prisma.userEkyc.findMany({
                where: { user: { role: 'USER' } },
                orderBy: { createdAt: 'desc' },
                take: 50,
                select: {
                    id: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            profile: { select: { avatarUrl: true } },
                        },
                    },
                },
            });

            for (const e of ekycs) {
                if (!e.user) continue;
                items.push({
                    id: `ekyc-${e.id}`,
                    username: e.user.username,
                    email: e.user.email,
                    avatarUrl: e.user.profile?.avatarUrl || null,
                    activity: 'Xác minh CCCD',
                    date: e.createdAt,
                    type: 'EKYC',
                });
            }
        }

        if (!filter || filter === '4') {
            const donations = await this.prisma.donation.findMany({
                where: { status: 'SUCCESS', user: { isNot: null } },
                orderBy: { createdAt: 'desc' },
                take: 50,
                include: {
                    user: {
                        select: { id: true, username: true, email: true, profile: { select: { avatarUrl: true } } }
                    }
                }
            });
            for (const d of donations) {
                if (!d.user) continue;
                items.push({
                    id: `donate-${d.id}`,
                    username: d.user.username,
                    email: d.user.email,
                    avatarUrl: d.user.profile?.avatarUrl || null,
                    activity: `Đã quyên góp ${Number(d.amount).toLocaleString()} đ`,
                    date: d.createdAt,
                    type: 'DONATION',
                });
            }
        }

        if (!filter || filter === '5') {
            const withdrawals = await this.prisma.withdrawalRequest.findMany({
                orderBy: { createdAt: 'desc' },
                take: 50,
                include: {
                    campaign: {
                        include: {
                            creatorUser: {
                                select: { id: true, username: true, email: true, profile: { select: { avatarUrl: true } } }
                            }
                        }
                    }
                }
            });
            for (const w of withdrawals) {
                const u = w.campaign?.creatorUser;
                if (!u) continue;
                items.push({
                    id: `withdraw-${w.id}`,
                    username: u.username,
                    email: u.email,
                    avatarUrl: u.profile?.avatarUrl || null,
                    activity: `Đã yêu cầu rút ${Number(w.amount).toLocaleString()} đ`,
                    date: w.createdAt,
                    type: 'WITHDRAWAL',
                });
            }
        }

        // Sort combined by date descending
        items.sort((a, b) => b.date.getTime() - a.date.getTime());

        return items.slice(0, 50);
    }
}
