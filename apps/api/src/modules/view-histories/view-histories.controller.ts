import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ViewHistoriesService } from './view-histories.service';
import { GetViewHistoriesQueryDto } from './dto/get-view-histories-query.dto';

/**
 * ViewHistoriesController
 *
 * Xử lý tracking lịch sử xem chiến dịch (campaign view history)
 * ⚠️ BẮT BUỘC JWT Token (JwtAuthGuard)
 *
 * Endpoints:
 * - POST /view-histories/:campaignId - Track khi user xem campaign
 * - GET /view-histories - Danh sách campaigns đã xem (mới nhất trước)
 */
@Controller('view-histories')
@UseGuards(JwtAuthGuard)
export class ViewHistoriesController {
  constructor(private readonly viewHistoriesService: ViewHistoriesService) {}

  /**
   * Helper: Lấy userId từ JWT token
   * JWT payload có dạng: { sub: userId, role: "USER", ... }
   */
  private getUserId(req: any): string {
    const userId = req?.user?.sub ?? req?.user?.id;
    if (!userId) throw new UnauthorizedException();
    return userId;
  }

  /**
   * POST /view-histories/:campaignId
   *
   * Track khi user xem campaign detail
   * Nếu chưa có record -> create bản ghi mới
   * Nếu đã có -> update viewed_at = now()
   *
   * Path Parameters:
   * - campaignId: string - UUID của campaign
   *
   * Response:
   * {
   *   tracked: true,
   *   history: { id, userId, campaignId, viewedAt }
   * }
   */
  @Post(':campaignId')
  track(@Req() req: any, @Param('campaignId') campaignId: string) {
    const userId = this.getUserId(req);
    return this.viewHistoriesService.trackView(userId, campaignId);
  }

  /**
   * GET /view-histories
   *
   * Lấy danh sách campaigns đã xem, sắp xếp theo viewed_at mới nhất trước
   *
   * Query Parameters:
   * - page: number (default: 1) - Trang hiện tại
   * - limit: number (default: 20, max: 100) - Số item trên trang
   *
   * Response:
   * {
   *   meta: { page, limit, total, totalPages },
   *   items: [
   *     {
   *       id, title, category, ...,
   *       lastViewedAt: DateTime,
   *       favoritesCount: number
   *     }
   *   ]
   * }
   */
  @Get()
  list(@Req() req: any, @Query() query: GetViewHistoriesQueryDto) {
    const userId = this.getUserId(req);
    return this.viewHistoriesService.list(userId, query.page, query.limit);
  }
}
