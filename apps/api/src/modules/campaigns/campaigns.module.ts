import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { AuthModule } from '../auth/auth.module';

/**
 * CampaignsModule
 * 
 * Feature module cho campaigns
 * 
 * Endpoints:
 * - GET /campaigns (list, public)
 * - GET /campaigns/:id (detail, public)
 * 
 * Providers:
 * - CampaignsService: business logic
 * - CampaignsController: request handling
 * 
 * Imports:
 * - PrismaModule: database access
 */
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, AuthModule, MailModule],
  controllers: [CampaignsController],
  providers: [CampaignsService],
})
export class CampaignsModule { }
