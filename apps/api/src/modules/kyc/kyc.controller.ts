import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { KycService } from './kyc.service';
import { CreateKycSessionDto } from './dto/create-kyc-session.dto';

/**
 * KycController
 *
 * User endpoints để tạo KYC session và check status
 * ⚠️ BẮT BUỘC: JWT Token
 *
 * Endpoints:
 * - POST /kyc/sessions - Tạo KYC session mới
 * - GET /kyc/sessions/latest - Lấy latest KYC session
 */
@Controller('kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  private getUserId(req: any): string {
    const userId = req?.user?.sub ?? req?.user?.id ?? req?.user?.userId;
    if (!userId) throw new UnauthorizedException();
    return userId;
  }

  /**
   * POST /kyc/sessions
   *
   * Tạo KYC session mới
   *
   * Body:
   * {
   *   provider?: "mock" | "sumsub" (default: "mock")
   * }
   *
   * Response:
   * {
   *   sessionId: string
   *   provider: string
   *   redirectUrl: string (nơi user sẽ verify documents)
   *   status: KycStatus
   * }
   */
  @Post('sessions')
  createSession(@Req() req: any, @Body() dto: CreateKycSessionDto) {
    const userId = this.getUserId(req);
    return this.kycService.createSession(userId, dto.provider ?? 'mock');
  }

  /**
   * GET /kyc/sessions/latest
   *
   * Lấy latest KYC session status
   *
   * Response:
   * {
   *   id: string
   *   status: KycStatus
   *   reviewResult?: string
   *   rejectReason?: string
   *   extractedFullName?: string
   *   createdAt: DateTime
   *   updatedAt: DateTime
   * }
   */
  @Get('sessions/latest')
  latest(@Req() req: any) {
    const userId = this.getUserId(req);
    return this.kycService.latest(userId);
  }
}
