import {
  Body,
  Controller,
  Post,
  Param,
  BadRequestException,
  Logger,
  Headers,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { KycService } from './kyc.service';
import { SumsubService } from './sumsub.service';

/**
 * KycWebhookController
 *
 * Public endpoints để nhận callback từ KYC providers
 * ⚠️ KHÔNG có authentication - provider sẽ gọi endpoint này
 *
 * Security:
 * - Mỗi provider PHẢI có signature verification
 * - Sumsub: Verify X-Signature header
 * - Mock: No verification (test only)
 *
 * Endpoints:
 * - POST /kyc/webhook/:provider - Nhận callback từ provider
 */
@Controller('kyc/webhook')
export class KycWebhookController {
  private readonly logger = new Logger('KycWebhookController');

  constructor(
    private readonly kycService: KycService,
    private readonly sumsubService: SumsubService,
  ) {}

  /**
   * POST /kyc/webhook/:provider
   *
   * Nhận event/callback từ KYC provider
   *
   * Headers (Sumsub):
   * - X-Signature: HMAC-SHA256(body + secret)
   *
   * Params:
   * - provider: "mock" | "sumsub"
   *
   * Body (từ provider):
   * Sumsub: { applicantId, applicantStatus, reviewStatus, ... }
   * Mock: { externalRef, decision, reason, ... }
   *
   * Response: { success: boolean, message: string }
   */
  @Post(':provider')
  async webhook(
    @Param('provider') provider: string,
    @Body() payload: any,
    @Headers('x-signature') signature: string,
    @Req() req: Request,
  ) {
    try {
      // 🔒 Security: Verify signature per provider
      this.verifySignature(provider, payload, signature);

      // ✅ Process webhook
      this.logger.log(
        `Received webhook from ${provider}: applicant/ref=${payload.applicantId || payload.externalRef}`,
      );

      const result = await this.kycService.applyWebhook(provider, payload);

      return {
        success: true,
        message: `Webhook processed. KYC status: ${result.newStatus}`,
      };
    } catch (error) {
      this.logger.error(
        `Webhook error from ${provider}:`,
        error instanceof Error ? error.message : String(error),
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 🔒 Signature Verification
   *
   * Sumsub: Verify X-Signature header = HMAC-SHA256(body + secret)
   * Mock: No verification (testing only)
   */
  private verifySignature(provider: string, payload: any, signature?: string): void {
    if (provider === 'sumsub') {
      if (!signature) {
        throw new BadRequestException('Missing X-Signature header from Sumsub');
      }

      const isValid = this.sumsubService.verifyWebhookSignature(payload, signature);

      if (!isValid) {
        this.logger.warn('Invalid Sumsub webhook signature');
        throw new BadRequestException('Invalid webhook signature from Sumsub');
      }

      this.logger.debug('Sumsub webhook signature verified');
    } else if (provider === 'mock') {
      // No verification for mock provider (testing only)
      this.logger.debug('Mock provider - signature verification skipped');
    } else {
      this.logger.warn(`Unknown provider: ${provider}`);
      // For unknown providers, we can either reject or allow with warning
      // For safety, we'll reject
      throw new BadRequestException(`Unknown KYC provider: ${provider}`);
    }
  }
}

