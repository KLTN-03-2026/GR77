import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetCampaignsQueryDto } from './dto/get-campaigns-query.dto';
import { AdminPermission } from '../../constants/permissions';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ReportCampaignDto } from './dto/report-campaign.dto';
import { CreateCampaignNewsDto } from './dto/create-campaign-news.dto';
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
import { OnModuleInit } from '@nestjs/common';

@Injectable()
export class CampaignsService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly notificationsService: NotificationsService
  ) { }

  async onModuleInit() {
    // Chạy đồng bộ dữ liệu ngầm để không chặn quá trình khởi động Server
    this.syncLegacyBalances().catch(err =>
      console.error('[CampaignsService] Background sync failed:', err)
    );
  }

  private async syncLegacyBalances() {
    console.log('[CampaignsService] Starting sync for legacy currentBalance...');
    try {
      const result = await this.prisma.$executeRawUnsafe(`
        UPDATE campaigns 
        SET current_balance = current_raised_amount 
        WHERE (current_balance = 0 OR current_balance IS NULL) 
        AND current_raised_amount > 0
      `);
      console.log(`[CampaignsService] Successfully synced ${result} campaigns.`);
    } catch (error) {
      console.error('[CampaignsService] Raw SQL sync error:', error);
    }
  }

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
          categoryRel: true,
          _count: { select: { donations: true, favorites: true } }
        }
      })
    ]);

    return {
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      items: items.map((c: any) => ({
        ...c,
        currentRaisedAmount: Number(c.currentRaisedAmount || 0),
        currentBalance: Number(c.currentBalance || 0),
        fundingGoalAmount: Number(c.fundingGoalAmount || 0),
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
      link: `/creator/campaigns/${campaign.id}`
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
      link: `/creator/campaigns/${campaign.id}`
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

    if (userId) {
      where.creatorUserId = { not: userId };
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
          currentBalance: true,
          startAt: true,
          endAt: true,
          autoCloseWhenGoalReached: true,
          status: true,
          donationCount: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { favorites: true } },
          categoryRel: true,
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
        currentRaisedAmount: Number(c.currentRaisedAmount || 0),
        currentBalance: Number(c.currentBalance || 0),
        fundingGoalAmount: Number(c.fundingGoalAmount || 0),
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
        currentBalance: true,
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
      currentRaisedAmount: Number(c.currentRaisedAmount || 0),
      fundingGoalAmount: Number(c.fundingGoalAmount || 0),
      amountRaised: Number(c.currentRaisedAmount || 0),
      progress: Number(c.fundingGoalAmount) > 0 ? (Number(c.currentRaisedAmount || 0) / Number(c.fundingGoalAmount)) * 100 : 0,
      favoritesCount: c._count.favorites,
      _count: undefined,
    }));
  }

  async getMyStats(userId: string) {
    const now = new Date();

    // === 1. Area Chart: total donations per day for last 7 days ===
    // Get all campaigns owned by user
    const myCampaigns = await this.prisma.campaign.findMany({
      where: { creatorUserId: userId },
      select: { id: true },
    });
    const myCampaignIds = myCampaigns.map((c: any) => c.id);

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days: { name: string; value: number; date: Date }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      last7Days.push({ name: dayLabels[d.getDay()], value: 0, date: d });
    }

    if (myCampaignIds.length > 0) {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const donations = await (this.prisma as any).donation.findMany({
        where: {
          campaignId: { in: myCampaignIds },
          status: 'SUCCESS',
          donatedAt: { gte: sevenDaysAgo },
        },
        select: { amount: true, donatedAt: true },
      });

      for (const don of donations) {
        const donDate = new Date(don.donatedAt);
        donDate.setHours(0, 0, 0, 0);
        const slot = last7Days.find(
          (d) => d.date.toDateString() === donDate.toDateString(),
        );
        if (slot) slot.value += Number(don.amount);
      }
    }

    const areaChart = last7Days.map((d) => ({ name: d.name, value: d.value }));

    // === 2. Bar Chart: campaigns created per day this week ===
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyCampaigns = await (this.prisma as any).campaign.findMany({
      where: {
        creatorUserId: userId,
        createdAt: { gte: startOfWeek },
      },
      select: { createdAt: true, status: true },
    });

    const barMap: Record<string, { active: number; pending: number }> = {};
    for (const label of dayLabels) {
      barMap[label] = { active: 0, pending: 0 };
    }
    for (const camp of weeklyCampaigns) {
      const label = dayLabels[new Date(camp.createdAt).getDay()];
      if (camp.status === 'ACTIVE') barMap[label].active += 1;
      else barMap[label].pending += 1;
    }
    const barChart = dayLabels.map((label) => ({
      name: label,
      active: barMap[label].active,
      pending: barMap[label].pending,
    }));

    // === 3. Total Raised & Goal ===
    const aggregated = await (this.prisma as any).campaign.aggregate({
      where: { creatorUserId: userId },
      _sum: { currentRaisedAmount: true, fundingGoalAmount: true },
      _count: { id: true },
    });

    const totalRaised = Number(aggregated._sum.currentRaisedAmount || 0);
    const totalGoal = Number(aggregated._sum.fundingGoalAmount || 0);
    const campaignCount = aggregated._count.id || 0;

    return { areaChart, barChart, totalRaised, totalGoal, campaignCount };
  }

  async detail(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        creatorUser: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true
              }
            },
            wallet: {
              select: {
                walletAddress: true
              }
            }
          }
        },
        categoryRel: true,
        images: { orderBy: { order: 'asc' } },
        comments: {
          where: { parentId: null },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profile: {
                  select: { avatarUrl: true }
                }
              }
            },
            replies: {
              take: 5,
              orderBy: { createdAt: 'asc' },
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    profile: {
                      select: { avatarUrl: true }
                    }
                  }
                }
              }
            }
          }
        },
        donations: {
          where: { status: 'SUCCESS' },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatarUrl: true
                  }
                }
              }
            }
          }
        },
        withdrawalRequests: {
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        news: {
          orderBy: { createdAt: 'desc' }
        },
        _count: { select: { favorites: true, donations: true, participants: true } }
      }
    });

    if (!campaign) throw new NotFoundException('Campaign not found');

    // Auto-sync currentBalance if it's 0 but there is raised amount (for legacy data)
    let finalBalance = Number(campaign.currentBalance || 0);
    if (finalBalance === 0 && Number(campaign.currentRaisedAmount) > 0) {
      await this.prisma.campaign.update({
        where: { id: campaign.id },
        data: { currentBalance: campaign.currentRaisedAmount }
      });
      finalBalance = Number(campaign.currentRaisedAmount);
    }

    return {
      ...campaign,
      currentRaisedAmount: Number(campaign.currentRaisedAmount || 0),
      currentBalance: finalBalance,
      fundingGoalAmount: Number(campaign.fundingGoalAmount || 0),
      minimumDonationAmount: Number(campaign.minimumDonationAmount || 0),
      amountRaised: Number(campaign.currentRaisedAmount || 0),
      progress: Number(campaign.fundingGoalAmount) > 0 ? (Number(campaign.currentRaisedAmount || 0) / Number(campaign.fundingGoalAmount)) * 100 : 0,
      favoritesCount: campaign._count.favorites,
      donationsCount: campaign._count.donations,
      participantsCount: campaign._count.participants,
      _count: undefined,
    };
  }

  async create(userId: string, dto: CreateCampaignDto) {
    if (dto.minimumDonationAmount > dto.fundingGoalAmount) {
      throw new BadRequestException('Minimum donation amount cannot be greater than the funding goal amount');
    }

    // Check if user is KYC verified
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isKycVerified: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isKycVerified) {
      throw new ForbiddenException('You must complete eKYC verification to create a campaign');
    }

    const { galleryUrls, ...rest } = dto;
    const campaign = await (this.prisma as any).campaign.create({
      data: {
        ...rest,
        creatorUserId: userId,
        status: 'PENDING',
        images: galleryUrls ? {
          create: galleryUrls.map((url, index) => ({
            url,
            order: index
          }))
        } : undefined
      },
      include: { creatorUser: true, images: true }
    });

    // Notify Admins (In-app)
    await this.notificationsService.notifyAdmins({
      title: 'New Campaign Submission',
      message: `"${campaign.creatorUser.username || campaign.creatorUser.email}" submitted a new campaign: "${campaign.title}"`,
      type: 'CAMPAIGN_SUBMITTED',
      link: `/admin/campaigns?id=${campaign.id}`
    }, AdminPermission.CAMPAIGNS_APPROVE);

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

    // Validation for amounts if both are present or if only one is updated
    const finalGoal = dto.fundingGoalAmount ?? Number(campaign.fundingGoalAmount);
    const finalMin = dto.minimumDonationAmount ?? Number(campaign.minimumDonationAmount);

    if (finalMin > finalGoal) {
      throw new BadRequestException('Minimum donation amount cannot be greater than the funding goal amount');
    }

    const { galleryUrls, ...restDto } = dto;

    return (this.prisma as any).campaign.update({
      where: { id },
      data: {
        ...restDto,
        ...(galleryUrls ? {
          images: {
            deleteMany: {},
            create: galleryUrls.map((url, index) => ({ url, order: index }))
          }
        } : {})
      },
    });
  }

  async report(userId: string, campaignId: string, dto: ReportCampaignDto) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    await this.prisma.userActionLog.create({
      data: {
        userId,
        action: 'REPORT_CAMPAIGN',
        details: `Reported campaign ${campaignId} for: ${dto.reason}`,
      },
    });

    const report = await this.prisma.report.create({
      data: {
        submitterId: userId,
        targetCampaignId: campaignId,
        targetUserId: campaign.creatorUserId,
        reason: dto.reason,
        details: dto.details
      },
      include: {
        submitter: {
          select: {
            username: true,
            profile: { select: { firstName: true, lastName: true } }
          }
        },
        targetCampaign: {
          select: { title: true }
        }
      }
    });

    const submitterName = report.submitter.profile?.firstName
      ? `${report.submitter.profile.firstName} ${report.submitter.profile.lastName || ''}`.trim()
      : report.submitter.username;

    await this.notificationsService.notifyAdmins({
      title: 'Báo cáo chiến dịch mới',
      message: `${submitterName} đã báo cáo chiến dịch "${report.targetCampaign?.title}" với lý do: ${dto.reason}`,
      type: 'REPORT',
      link: '/admin/report',
    });

    return report;
  }

  async postNews(userId: string, campaignId: string, dto: CreateCampaignNewsDto) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        participants: {
          select: { userId: true },
        },
      },
    });

    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.creatorUserId !== userId) throw new ForbiddenException('Not your campaign');

    const news = await this.prisma.campaignNews.create({
      data: {
        campaignId,
        title: dto.title,
        content: dto.content,
      },
    });

    // Notify supporters (participants or donors - we use participants here)
    const supporters = campaign.participants;
    if (supporters.length > 0) {
      const notifications = supporters.map(p => ({
        userId: p.userId,
        title: `Tin tức mới: ${campaign.title}`,
        message: `Tác giả vừa đăng thông báo: ${dto.title}`,
        type: 'CAMPAIGN_NEWS',
        link: `/joined/${campaignId}`
      }));
      await this.prisma.notification.createMany({ data: notifications });
    }

    return news;
  }
  /**
   * GET Transparency Data
   * Returns a consolidated view of all inflows (donations) and outflows (withdrawals)
   */
  async getTransparency(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, title: true, currentRaisedAmount: true }
    });

    if (!campaign) throw new NotFoundException('Campaign not found');

    // Fetch all successful donations (INFLOW)
    const inflows = await (this.prisma as any).donation.findMany({
      where: { campaignId, status: 'SUCCESS' },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            username: true,
            profile: { select: { firstName: true, lastName: true } }
          }
        },
        paymentTransactions: {
          where: { status: 'SUCCESS', provider: 'BLOCKCHAIN' },
          select: { transId: true }
        }
      }
    });

    // Fetch all disbursed withdrawals (OUTFLOW)
    const outflows = await (this.prisma as any).withdrawalRequest.findMany({
      where: { campaignId, status: 'DISBURSED' },
      orderBy: { createdAt: 'desc' },
    });

    // Map to a unified ledger format
    const ledger = [
      ...inflows.map((i: any) => {
        const cryptoTx = i.paymentTransactions?.[0]?.transId;
        return {
          id: i.id,
          type: 'IN' as const,
          amount: Number(i.amount),
          date: i.donatedAt || i.createdAt,
          actor: i.user?.profile
            ? `${i.user.profile.firstName || ''} ${i.user.profile.lastName || ''}`.trim()
            : (i.user?.username || 'An danh'),
          txHash: cryptoTx,
          proofUrl: cryptoTx ? `https://amoy.polygonscan.com/tx/${cryptoTx}` : null
        };
      }),
      ...outflows.map((o: any) => ({
        id: o.id,
        type: 'OUT' as const,
        amount: Number(o.amount),
        date: o.approvedAt || o.createdAt,
        actor: 'Cơ quan giải ngân Kindlink',
        txHash: o.onchainTxHash,
        proofUrl: o.onchainTxHash ? `https://amoy.polygonscan.com/tx/${o.onchainTxHash}` : null,
        bankProof: o.bankTransferProof,
        note: o.adminNote,
        meta: o.polAmount ? { polAmount: o.polAmount, rate: o.exchangeRate } : null
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      campaignId: campaign.id,
      title: campaign.title,
      currentBalance: Number(campaign.currentRaisedAmount),
      ledger
    };
  }
}
