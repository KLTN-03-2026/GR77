import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ViewHistoriesService {
  constructor(private readonly prisma: PrismaService) {}

  // click xem: nếu chưa có -> create, có -> update viewedAt
  async trackView(userId: string, campaignId: string) {
    const exists = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Campaign not found');

    // Prisma upsert theo unique compound key userId + campaignId
    const record = await this.prisma.campaignViewHistory.upsert({
      where: {
        userId_campaignId: { userId, campaignId },
      },
      create: { userId, campaignId, viewedAt: new Date() },
      update: { viewedAt: new Date() },
      select: { id: true, userId: true, campaignId: true, viewedAt: true },
    });

    return { tracked: true, history: record };
  }

  // list campaign đã xem, sắp xếp mới nhất trước
  async list(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.campaignViewHistory.count({ where: { userId } }),
      this.prisma.campaignViewHistory.findMany({
        where: { userId },
        orderBy: { viewedAt: 'desc' },
        skip,
        take: limit,
        select: {
          viewedAt: true,
          campaign: {
            select: {
              id: true,
              creatorUserId: true,
              title: true,
              category: true,
              locationText: true,
              coverImageUrl: true,
              fundingGoalAmount: true,
              minimumDonationAmount: true,
              startAt: true,
              endAt: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              _count: { select: { favorites: true } },
            },
          },
        },
      }),
    ]);

    return {
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      items: rows.map((r) => {
        const { _count, ...campaign } = r.campaign;
        return {
          ...campaign,
          lastViewedAt: r.viewedAt,
          favoritesCount: _count.favorites,
        };
      }),
    };
  }
}
