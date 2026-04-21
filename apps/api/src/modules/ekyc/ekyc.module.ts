import { Module } from '@nestjs/common';
import { EkycService } from './ekyc.service';
import { EkycController } from './ekyc.controller';
import { OcrService } from './services/ocr.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [EkycController],
    providers: [EkycService, OcrService],
    exports: [EkycService],
})
export class EkycModule { }
