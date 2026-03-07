import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetCampaignsQueryDto } from './dto/get-campaigns-query.dto';

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
  constructor(private readonly prisma: PrismaService) {}

  /**
   * list()
   * 
   * Lấy danh sách chiến dịch với phân trang, tìm kiếm, lọc
   * 
   * Parameters: query: GetCampaignsQueryDto
   * - page: trang hiện tại (default: 1)
   * - limit: số item/trang (default: 20, max: 100)
   * - status: lọc theo trạng thái (default: ACTIVE)
   * - category: lọc theo danh mục (optional)
   * - q: tìm kiếm trong title/description/location (optional)
   */
  async list(query: GetCampaignsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Default: chỉ show ACTIVE campaigns (public view)
    where.status = query.status ?? 'ACTIVE';

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
   * detail()
   * 
   * Lấy chi tiết 1 chiến dịch theo ID
   * Trả về toàn bộ thông tin (bao gồm admin review fields)
   * 
   * Throws: NotFoundException (404) nếu campaign không tồn tại
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
}
