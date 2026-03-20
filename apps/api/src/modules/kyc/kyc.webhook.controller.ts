import {
  Body,
  Controller,
  Post,
  Param,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { KycService } from './kyc.service';

/**
 * KycWebhookController
 *
 * Public endpoints để nhận callback từ KYC providers
 * ⚠️ KHÔNG có authentication - provider sẽ gọi endpoint này
 *
 * Security:
 * - Mỗi provider PHẢI có signature verification
 * - Hiện tại mocked (trong thực tế, implement per-provider)
 * - Verify: X-Signature header hoặc body payload
 *
 * Endpoints:
 * - POST /kyc/webhook/:provider - Nhận callback từ provider
 */
@Controller('kyc/webhook')
export class KycWebhookController {
  private readonly logger = new Logger('KycWebhookController');

  constructor(private readonly kycService: KycService) {}

  /**
   * POST /kyc/webhook/:provider
   *
   * Nhận event/callback từ KYC provider
   *
   * Params:
   * - provider: "mock" | "sumsub" | "onfido" | "jumio"
   *
   * Body (từ provider):
   * {
   *   sessionId?: string
   *   externalRef?: string
   *   decision?: string | "APPROVED" | "REJECTED" | "ON_HOLD"
   *   reason?: string
   *   reviewResult?: string
   *   extractedData?: {
   *     fullName?: string
   *     dateOfBirth?: string
   *     documentNumber?: string
   *     nationality?: string
   *   }
   * }
   *
   * Response:
   * {
   *   success: boolean
   *   message: string
   * }
   */
  @Post(':provider')
  async webhook(
    @Param('provider') provider: string,
    @Body() payload: any,
  ) {
    try {
      // 🔒 Security: Verify signature per provider
      this.verifySignature(provider, payload);

      // ✅ Process webhook
      this.logger.log(
        `Received webhook from ${provider}: ${JSON.stringify(payload)}`,
      );

      const result = await this.kycService.applyWebhook(provider, payload);

      return {
        success: true,
        message: `Webhook processed. User KYC status: ${result.kycStatus}`,
      };
    } catch (error) {
      this.logger.error(
        `Webhook error from ${provider}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw new BadRequestException({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * 🔒 Signature Verification
   *
   * MOCK: Passes all signatures
   * PRODUCTION:
   * - Sumsub: Verify SHA256(body + secret) == X-Signature
   * - Onfido: Verify HMAC-SHA256
   * - Jumio: Verify HMAC-SHA256
   */
  private verifySignature(provider: string, payload: any): void {
    // TODO: Implement per-provider signature verification
    // For now, all signatures pass (mock mode)

    // Example validation:
    // const signature = req.headers['x-signature'];
    // const secret = process.env[`KYC_${provider.toUpperCase()}_SECRET`];
    // const computed = crypto.createHash('sha256')
    //   .update(JSON.stringify(payload) + secret)
    //   .digest('hex');
    // if (signature !== computed) throw new BadRequestException('Invalid signature');
  }
}
