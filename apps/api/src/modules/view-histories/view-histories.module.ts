import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ViewHistoriesController } from './view-histories.controller';
import { ViewHistoriesService } from './view-histories.service';

@Module({
  imports: [PrismaModule],
  controllers: [ViewHistoriesController],
  providers: [ViewHistoriesService],
})
export class ViewHistoriesModule {}
