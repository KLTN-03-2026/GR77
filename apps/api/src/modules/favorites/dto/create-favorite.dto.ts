import { IsString } from 'class-validator';

/**
 * CreateFavoriteDto
 * 
 * Request body cho endpoint POST /favorites
 * 
 * Xác định campaign nào sẽ được thêm vào danh sách yêu thích
 * userId sẽ được lấy từ JWT token tự động
 */
export class CreateFavoriteDto {
  /**
   * campaignId
   * UUID của campaign cần yêu thích
   * Bắt buộc phải có
   * 
   * VD: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
   */
  @IsString()
  campaignId: string;
}
