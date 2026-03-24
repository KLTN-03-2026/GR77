import { Module } from '@nestjs/common';
import { KycService } from './kyc.service';
import { SumsubService } from './sumsub.service';
import { KycController } from './kyc.controller';
import { KycWebhookController } from './kyc.webhook.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

/**
 * KycModule
 *
 * Module cho KYC (Know Your Customer) verification
 *
 * ✅ Provides:
 * - KycService: Business logic
 * - KycController: User endpoints (requires JWT)
 * - KycWebhookController: Provider callbacks (public)
 *
 * ✅ Imports:
 * - PrismaModule: Database access
 * - AuthModule: JWT strategy
 *
 * ✅ Routes:
 * - POST /kyc/sessions - Create session (requires JWT)
 * - GET /kyc/sessions/latest - Get status (requires JWT)
 * - POST /kyc/webhook/:provider - Receive provider callback (public)
 */
@Module({
  imports: [PrismaModule, AuthModule],
  providers: [KycService, SumsubService],
  controllers: [KycController, KycWebhookController],
  exports: [KycService],
})
export class KycModule {}
