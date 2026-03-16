import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

/**
 * FavoritesController
 * 
 * Xử lý việc yêu thích/bỏ yêu thích chiến dịch
 * ⚠️ BẮT BUỘC JWT Token (JwtAuthGuard)
 * 
 * Endpoints:
 * - POST /favorites - Yêu thích 1 campaign
 * - DELETE /favorites/:campaignId - Bỏ yêu thích
 * - GET /favorites - Danh sách campaigns được yêu thích
 */
@Controller('favorites')
@UseGuards(JwtAuthGuard) // Bắt buộc phải login
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) { }

  /**
   * Helper: Lấy userId từ JWT token
   * JWT payload có dạng: { sub: userId, role: "USER", ... }
   */
  private getUserId(req: any): string {
    const userId = req?.user?.userId ?? req?.user?.sub ?? req?.user?.id;
    if (!userId) throw new UnauthorizedException();
    return userId;
  }

  /**
   * POST /favorites
   * 
   * Thêm 1 campaign vào danh sách yêu thích
   * 
   * Request Body: { campaignId: string }
   * 
   * Response:
   * - Nếu mới yêu thích: { favorited: true, favorite: { id, userId, campaignId, createdAt } }
   * - Nếu đã yêu thích: { favorited: true } (idempotent)
   * 
   * Error:
   * - 404 Not Found - Campaign không tồn tại
   * - 401 Unauthorized - Không có token hoặc token invalid
   */
  @Post()
  favorite(@Req() req: any, @Body() dto: CreateFavoriteDto) {
    const userId = this.getUserId(req);
    return this.favoritesService.favorite(userId, dto.campaignId);
  }

  /**
   * DELETE /favorites/:campaignId
   * 
   * Bỏ yêu thích 1 campaign
   * 
   * Path Parameters:
   * - campaignId: string (UUID)
   * 
   * Response: { unfavorited: true }
   * 
   * Note: Idempotent - Lần thứ 2 xóa vẫn trả success
   */
  @Delete(':campaignId')
  unfavorite(@Req() req: any, @Param('campaignId') campaignId: string) {
    const userId = this.getUserId(req);
    return this.favoritesService.unfavorite(userId, campaignId);
  }

  /**
   * GET /favorites
   * 
   * Danh sách các campaign mà user đã yêu thích
   * Paginated, sắp xếp mới nhất trước
   * 
   * Query Parameters:
   * - page: number (default: 1)
   * - limit: number (default: 20)
   * 
   * Response:
   * {
   *   meta: { page, limit, total, totalPages },
   *   items: [
   *     {
   *       ...campaign fields,
   *       favoritedAt: DateTime (thời điểm yêu thích)
   *     }
   *   ]
   * }
   */
  @Get()
  list(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = this.getUserId(req);
    return this.favoritesService.list(
      userId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }
}
