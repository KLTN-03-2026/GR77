import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [PrismaModule, ConfigModule],
    controllers: [WalletController],
    providers: [WalletService],
    exports: [WalletService]
})
export class WalletModule { }
