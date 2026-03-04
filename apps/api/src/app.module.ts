import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { FavoritesModule } from './modules/favorites/favorites.module';

/**
 * AppModule
 * 
 * Root module của NestJS application
 * Import tất cả feature modules
 * 
 * Modules:
 * - ConfigModule: Environment variables (.env)
 * - PrismaModule: Database service (global)
 * - AuthModule: Authentication, JWT, login/register/logout
 * - CampaignsModule: GET /campaigns (list), GET /campaigns/:id (detail)
 * - FavoritesModule: POST/DELETE/GET /favorites (yêu thích campaigns)
 * 
 * Controllers:
 * - AppController: GET / (test endpoint)
 * 
 * Providers:
 * - AppService: app-level business logic
 */
@Module({
  imports: [
    // Environment configuration (global)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Database
    PrismaModule,
    // Features
    AuthModule,      // Auth endpoints
    CampaignsModule, // Campaigns endpoints (public)
    FavoritesModule, // Favorites endpoints (JWT protected)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
