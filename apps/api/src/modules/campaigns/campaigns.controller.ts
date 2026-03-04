import { Controller, Get, Param, Query } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { GetCampaignsQueryDto } from './dto/get-campaigns-query.dto';

/**
 * CampaignsController
 * 
 * Xử lý công khai danh sách chiến dịch (không cần JWT)
 * Public endpoints để xem campaigns và chi tiết
 * 
 * Endpoints:
 * - GET /campaigns - Danh sách tất cả chiến dịch (active)
 * - GET /campaigns/:id - Chi tiết 1 chiến dịch
 */
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  /**
   * GET /campaigns
   * 
   * Lấy danh sách chiến dịch với phân trang, tìm kiếm và lọc
   * 
   * Query Parameters:
   * - page: number (default: 1) - Trang hiện tại
   * - limit: number (default: 20, max: 100) - Số item trên trang
   * - status: CampaignStatus (default: ACTIVE) - Trạng thái chiến dịch
   * - category: string - Danh mục (optional)
   * - q: string - Tìm kiếm theo title, description, location (optional)
   * 
   * Response:
   * {
   *   meta: { page, limit, total, totalPages },
   *   items: Campaign[]
   * }
   */
  @Get()
  list(@Query() query: GetCampaignsQueryDto) {
    return this.campaignsService.list(query);
  }

  /**
   * GET /campaigns/:id
   * 
   * Lấy chi tiết 1 chiến dịch
   * 
   * Path Parameters:
   * - id: string - UUID của chiến dịch
   * 
   * Response: Campaign detail object
   * 
   * Error:
   * - 404 Not Found - Campaign không tồn tại
   */
  @Get(':id')
  detail(@Param('id') id: string) {
    return this.campaignsService.detail(id);
  }
}
