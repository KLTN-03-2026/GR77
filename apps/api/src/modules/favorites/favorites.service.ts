import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * FavoritesService
 * 
 * Logic business cho yêu thích campaigns
 * - Thêm campaign vào danh sách yêu thích
 * - Bỏ campaign khỏi danh sách yêu thích
 * - Lấy danh sách campaigns được yêu thích
 * 
 * Mô hình: Favorites là many-to-many giữa User + Campaign
 * - Unique constraint (userId, campaignId): 1 user chỉ yêu thích 1 campaign 1 lần
 */
@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * favorite()
   * 
   * Thêm 1 campaign vào danh sách yêu thích của user
   * 
   * Parameters:
   * - userId: string (UUID, từ JWT token)
   * - campaignId: string (UUID của campaign cần yêu thích)
   * 
   * Returns:
   * - Mới yêu thích: { favorited: true, favorite: { id, userId, campaignId, createdAt } }
   * - Đã yêu thích: { favorited: true } (idempotent - không lỗi)
   * 
   * Logic:
   * 1. Kiểm tra campaign có tồn tại không (404 nếu không)
   * 2. Thử create favorite record
   * 3. Nếu lỗi P2002 (unique constraint) = đã yêu thích rồi
   * 4. Trả về { favorited: true } (idempotent)
   */
  async favorite(userId: string, campaignId: string) {
    // Kiểm tra campaign tồn tại
    const campaign = await (this.prisma as any).campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, creatorUserId: true },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    if (campaign.creatorUserId === userId) {
      throw new BadRequestException('Bạn không thể yêu thích chiến dịch do chính mình tổ chức');
    }

    try {
      // Tạo favorite record
      const fav = await (this.prisma as any).favorite.create({
        data: { userId, campaignId },
        select: { id: true, userId: true, campaignId: true, createdAt: true },
      });

      return { favorited: true, favorite: fav };
    } catch (e: any) {
      // P2002 = Unique constraint violation (already favorited)
      if (e?.code === 'P2002') {
        return { favorited: true }; // Idempotent
      }
      throw e;
    }
  }

  /**
   * unfavorite()
   * 
   * Bỏ yêu thích 1 campaign
   * 
   * Parameters:
   * - userId: string
   * - campaignId: string
   * 
   * Returns: { unfavorited: true }
   * 
   * Note: Idempotent - Lần thứ 2 gọi cũng không lỗi
   */
  async unfavorite(userId: string, campaignId: string) {
    // deleteMany sẽ xóa tất cả record matching condition
    // Nếu không có record cũng không lỗi (trả affected: 0)
    await (this.prisma as any).favorite.deleteMany({
      where: { userId, campaignId },
    });

    return { unfavorited: true };
  }

  /**
   * list()
   * 
   * Lấy danh sách campaigns mà user đã yêu thích
   * Paginated, sắp xếp mới nhất (yêu thích gần đây) trước
   * 
   * Parameters:
   * - userId: string (UUID)
   * - page: number (default: 1)
   * - limit: number (default: 20)
   * 
   * Returns:
   * {
   *   meta: { page, limit, total, totalPages },
   *   items: [
   *     {
   *       id, creatorUserId, title, description, category, ...,
   *       favoritedAt: DateTime (khi user yêu thích),
   *       favoritesCount: number (tổng favorites của campaign này)
   *     }
   *   ]
   * }
   * 
   * Logic:
   * 1. Calc skip từ page & limit
   * 2. Dùng transaction lấy count + items cùng lúc
   * 3. Joins với campaign table để lấy đầy đủ info campaign
   * 4. Map kết quả, rename _count.favorites -> favoritesCount
   * 5. Trả meta + items
   */
  async list(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    // Transaction: 2 queries cùng lúc
    const [total, favorites] = await (this.prisma as any).$transaction([
      // Count tổng favorites của user này
      (this.prisma as any).favorite.count({
        where: {
          userId,
          campaign: { creatorUserId: { not: userId } }
        }
      }),
      // Lấy favorites paginated, join với campaign
      (this.prisma as any).favorite.findMany({
        where: {
          userId,
          campaign: { creatorUserId: { not: userId } }
        },
        orderBy: { createdAt: 'desc' }, // Cái mới yêu thích trước
        skip,
        take: limit,
        select: {
          createdAt: true, // Thời điểm yêu thích
          campaign: {
            select: {
              id: true,
              creatorUserId: true,
              title: true,
              category: true,
              locationText: true,
              coverImageUrl: true,
              fundingGoalAmount: true,
              currentRaisedAmount: true,
              minimumDonationAmount: true,
              startAt: true,
              endAt: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              _count: { select: { favorites: true } }, // Tổng favorites của campaign
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
      items: favorites.map((f) => ({
        ...f.campaign,
        favoritedAt: f.createdAt, // Thêm thời điểm user yêu thích
        favoritesCount: f.campaign._count.favorites,
        _count: undefined,
      })),
    };
  }

  async getStatus(userId: string, campaignId: string) {
    const record = await (this.prisma as any).favorite.findUnique({
      where: { userId_campaignId: { userId, campaignId } },
      select: { id: true },
    });
    return { favorited: !!record };
  }
}
