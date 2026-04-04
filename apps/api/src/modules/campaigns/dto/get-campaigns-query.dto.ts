import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CampaignStatus } from '@prisma/client';

/**
 * GetCampaignsQueryDto
 * 
 * Query parameters cho endpoint GET /campaigns
 * Tất cả field đều optional
 * 
 * Validation:
 * - page: số nguyên, >= 1
 * - limit: số nguyên, 1-100
 * - status: phải là enum CampaignStatus
 * - category: string tự do
 * - q: string tìm kiếm
 */
export class GetCampaignsQueryDto {
  /**
   * page
   * Trang hiện tại (1-indexed)
   * Default: 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  /**
   * limit
   * Số item trên 1 trang
   * Default: 20
   * Max: 100 (chống DDoS)
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  /**
   * status
   * Lọc theo trạng thái chiến dịch
   * Phải là một trong: DRAFT, PENDING, ACTIVE, REJECTED, PAUSED, COMPLETED
   * Default: ACTIVE (service level)
   */
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  /**
   * category
   * Lọc theo danh mục
   * VD: "Education", "Healthcare", etc
   */
  @IsOptional()
  @IsString()
  category?: string;

  /**
   * q (query)
   * Tìm kiếm full-text trong:
   * - title (tiêu đề)
   * - description (mô tả)
   * - locationText (địa điểm)
   * 
   * Case-insensitive
   */
  @IsOptional()
  @IsString()
  q?: string;
}
