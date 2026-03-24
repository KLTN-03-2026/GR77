import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { UploadModule } from './modules/upload/upload.module';
import { ParticipantsModule } from './modules/participants/participants.module';
import { DonationsModule } from './modules/donations/donations.module';
import { WalletModule } from './modules/wallet/wallet.module';

@Module({
  imports: [
    // Environment configuration (global)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    CampaignsModule,
    FavoritesModule,
    UploadModule,
    ParticipantsModule,
    DonationsModule,
    WalletModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
