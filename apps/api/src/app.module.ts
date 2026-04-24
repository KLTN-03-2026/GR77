import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ViewHistoriesModule } from './modules/view-histories/view-histories.module';
import { UploadModule } from './modules/upload/upload.module';
import { ParticipantsModule } from './modules/participants/participants.module';
import { UsersModule } from './modules/users/users.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DonationsModule } from './modules/donations/donations.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CommentsModule } from './modules/comments/comments.module';
import { WithdrawalsModule } from './modules/withdrawals/withdrawals.module';
import { EkycModule } from './modules/ekyc/ekyc.module';
import { AdminDashboardModule } from './modules/admin-dashboard/admin-dashboard.module';
import { ReportModule } from './modules/report/report.module';

@Module({
  imports: [
    // Environment configuration (global)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    // Features
    AuthModule,         // Auth endpoints
    CampaignsModule,    // Campaigns endpoints (public)
    CategoriesModule,   // Categories endpoints
    FavoritesModule,    // Favorites endpoints (JWT protected)
    CommentsModule,     // Comments endpoints (public/protected)

    ViewHistoriesModule, // View history endpoints (JWT protected)
    UploadModule,
    ParticipantsModule,
    UsersModule,
    NotificationsModule,
    DonationsModule,
    WalletModule,
    WithdrawalsModule,
    EkycModule,
    AdminDashboardModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
