import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

/**
 * FavoritesModule
 * 
 * Feature module cho yêu thích campaigns
 * 
 * Endpoints (tất cả đều bắt buộc JWT):
 * - POST /favorites (add favorite)
 * - DELETE /favorites/:campaignId (remove favorite)
 * - GET /favorites (list favorites)
 * 
 * Providers:
 * - FavoritesService: business logic
 * - FavoritesController: request handling
 * 
 * Imports:
 * - PrismaModule: database access
 * 
 * Guards:
 * - JwtAuthGuard (tất cả routes được protect bởi @UseGuards)
 */
@Module({
  imports: [PrismaModule],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
