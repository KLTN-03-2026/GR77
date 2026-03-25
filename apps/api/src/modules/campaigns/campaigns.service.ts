import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetCampaignsQueryDto } from './dto/get-campaigns-query.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
/**
 * CampaignsService
 * 
 * Logic business cho campaigns
 * - Lấy danh sách chiến dịch (public, mặc định ACTIVE)
 * - Lấy chi tiết 1 chiến dịch
 * 
 * Note: Service này chỉ phục vụ việc đọc (GET)
 * CRUD đầy đủ sẽ được thêm sau (POST, PUT, DELETE)
 */
import { MailService } from '../mail/mail.service';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CampaignsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly notificationsService: NotificationsService
  ) { }

  async findAllAdmin(query: GetCampaignsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.category) where.category = { equals: query.category, mode: 'insensitive' };
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.campaign.count({ where }),
      this.prisma.campaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          creatorUser: { select: { id: true, username: true, email: true } },
          _count: { select: { donations: true, favorites: true } }
        }
      })
    ]);

    return {
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      items: items.map((c: any) => ({
        ...c,
        amountRaised: Number(c.currentRaisedAmount || 0),
        progress: Number(c.fundingGoalAmount) > 0 ? (Number(c.currentRaisedAmount || 0) / Number(c.fundingGoalAmount)) * 100 : 0,
        donationsCount: c._count.donations,
        favoritesCount: c._count.favorites,
        _count: undefined,
      }))
    };
  }

  async approve(id: string, adminId: string) {
    const campaign = await this.prisma.campaign.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        reviewedByAdminId: adminId,
        reviewedAt: new Date(),
        reviewNote: 'Approved by administrator'
      },
      include: { creatorUser: true }
    });

    await this.notificationsService.create({
      userId: campaign.creatorUserId,
      title: 'Campaign Approved!',
      message: `Your campaign "${campaign.title}" has been approved and is now live.`,
      type: 'CAMPAIGN_APPROVED',
      link: `/campaigns/${campaign.id}`
    });

    await this.mailService.sendCampaignStatusUpdateToUser(
      campaign.creatorUser.email,
      campaign.title,
      'ACTIVE'
    );

    return campaign;
  }

  async reject(id: string, adminId: string, note: string) {
    const campaign = await this.prisma.campaign.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedByAdminId: adminId,
        reviewedAt: new Date(),
        reviewNote: note
      },
      include: { creatorUser: true }
    });

    await this.notificationsService.create({
      userId: campaign.creatorUserId,
      title: 'Campaign Revision Required',
      message: `Your campaign "${campaign.title}" was not approved. Reason: ${note}`,
      type: 'CAMPAIGN_REJECTED',
      link: `/my-campaigns`
    });

    await this.mailService.sendCampaignStatusUpdateToUser(
      campaign.creatorUser.email,
      campaign.title,
      'REJECTED',
      note
    );

    return campaign;
  }

  async list(query: GetCampaignsQueryDto, userId?: string | null) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) {
      where.status = query.status;
    } else {
      where.status = 'ACTIVE';
    }

    if (query.category) {
      where.category = { equals: query.category, mode: 'insensitive' };
    }

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
        { locationText: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.campaign.count({ where }),
      this.prisma.campaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          creatorUserId: true,
          title: true,
          category: true,
          locationText: true,
          coverImageUrl: true,
          fundingGoalAmount: true,
          minimumDonationAmount: true,
          currentRaisedAmount: true,
          startAt: true,
          endAt: true,
          autoCloseWhenGoalReached: true,
          status: true,
          donationCount: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { favorites: true } },
        },
      }),
    ]);

    // Build a set of campaign IDs the user has favorited
    let favoritedIds = new Set<string>();
    if (userId) {
      const campaignIds = items.map((c: any) => c.id);
      const userFavorites = await (this.prisma as any).favorite.findMany({
        where: {
          userId,
          campaignId: { in: campaignIds },
        },
        select: { campaignId: true },
      });
      favoritedIds = new Set(userFavorites.map((f: any) => f.campaignId));
    }

    return {
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      items: items.map((c: any) => ({
        ...c,
        amountRaised: Number(c.currentRaisedAmount || 0),
        progress: Number(c.fundingGoalAmount) > 0 ? (Number(c.currentRaisedAmount || 0) / Number(c.fundingGoalAmount)) * 100 : 0,
        favoritesCount: c._count.favorites,
        isFavorited: favoritedIds.has(c.id),
        _count: undefined,
      })),
    };
  }

  async listMine(userId: string) {
    const items = await this.prisma.campaign.findMany({
      where: { creatorUserId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        locationText: true,
        coverImageUrl: true,
        fundingGoalAmount: true,
        minimumDonationAmount: true,
        currentRaisedAmount: true,
        startAt: true,
        endAt: true,
        autoCloseWhenGoalReached: true,
        status: true,
        donationCount: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { favorites: true } },
      },
    });

    return items.map((c: any) => ({
      ...c,
      amountRaised: Number(c.currentRaisedAmount || 0),
      progress: Number(c.fundingGoalAmount) > 0 ? (Number(c.currentRaisedAmount || 0) / Number(c.fundingGoalAmount)) * 100 : 0,
      favoritesCount: c._count.favorites,
      _count: undefined,
    }));
  }

  async detail(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        creatorUser: { select: { id: true, username: true, email: true } },
        _count: { select: { favorites: true, donations: true } }
      }
    });

    if (!campaign) throw new NotFoundException('Campaign not found');

    return {
      ...campaign,
      amountRaised: Number(campaign.currentRaisedAmount || 0),
      progress: Number(campaign.fundingGoalAmount) > 0 ? (Number(campaign.currentRaisedAmount || 0) / Number(campaign.fundingGoalAmount)) * 100 : 0,
      favoritesCount: campaign._count.favorites,
      donationsCount: campaign._count.donations,
      _count: undefined,
    };
  }

  async create(userId: string, dto: CreateCampaignDto) {
    const campaign = await (this.prisma as any).campaign.create({
      data: {
        ...dto,
        creatorUserId: userId,
        status: 'PENDING',
      },
      include: { creatorUser: true }
    });

    // Notify Admins (In-app)
    await this.notificationsService.notifyAdmins({
      title: 'New Campaign Submission',
      message: `"${campaign.creatorUser.username || campaign.creatorUser.email}" submitted a new campaign: "${campaign.title}"`,
      type: 'CAMPAIGN_SUBMITTED',
      link: `/admin/campaigns?id=${campaign.id}`
    });

    return campaign;
  }

  async update(userId: string, id: string, dto: UpdateCampaignDto) {
    const campaign = await (this.prisma as any).campaign.findUnique({
      where: { id },
    });

    if (!campaign) throw new NotFoundException('Campaign not found');

    if (campaign.creatorUserId !== userId) {
      throw new ForbiddenException('You do not have permission to update this campaign');
    }

    return (this.prisma as any).campaign.update({
      where: { id },
      data: dto,
    });
  }
}
