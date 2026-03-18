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
@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * list campaigns
   * 
   */
  async list(query: GetCampaignsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Nếu truyền status cụ thể thì lọc theo status đó, 
    // nếu không thì hiện tất cả trừ DRAFT
    if (query.status) {
      where.status = query.status;
    } else {
      where.status = { not: 'DRAFT' };
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

    // Transaction: lấy total count + items cùng lúc
    const [total, items] = await (this.prisma as any).$transaction([
      (this.prisma as any).campaign.count({ where }),
      (this.prisma as any).campaign.findMany({
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
          startAt: true,
          endAt: true,
          autoCloseWhenGoalReached: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { favorites: true } },
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
      items: items.map((c) => ({
        ...c,
        favoritesCount: c._count.favorites,
        _count: undefined,
      })),
    };
  }

  /**
   * my campaigns
   * 
   */
  async listMine(userId: string) {
    const items = await (this.prisma as any).campaign.findMany({
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
        startAt: true,
        endAt: true,
        autoCloseWhenGoalReached: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { favorites: true } },
      },
    });

    return items.map((c: any) => ({
      ...c,
      favoritesCount: c._count.favorites,
      _count: undefined,
    }));
  }


  /**
   * detail()
   * campaign/{id}
   */
  async detail(id: string) {
    const campaign = await (this.prisma as any).campaign.findUnique({
      where: { id },
      select: {
        id: true,
        creatorUserId: true,
        title: true,
        description: true,
        category: true,
        locationText: true,
        coverImageUrl: true,
        fundingGoalAmount: true,
        minimumDonationAmount: true,
        startAt: true,
        endAt: true,
        autoCloseWhenGoalReached: true,
        status: true,
        reviewNote: true,
        reviewedByAdminId: true,
        reviewedAt: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { favorites: true } },
      },
    });

    if (!campaign) throw new NotFoundException('Campaign not found');

    return {
      ...campaign,
      favoritesCount: campaign._count.favorites,
      _count: undefined,
    };
  }

  /**
   * create()
   * 
   */
  async create(userId: string, dto: CreateCampaignDto) {
    const campaign = await (this.prisma as any).campaign.create({
      data: {
        ...dto,
        creatorUserId: userId,
        status: 'PENDING',
      },
    });
    return campaign;
  }

  /**
   * update()
   * 
   */
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
