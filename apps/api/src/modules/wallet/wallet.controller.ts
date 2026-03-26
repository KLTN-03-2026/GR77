import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { TopUpDto } from './dto/top-up.dto';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
    constructor(private readonly walletService: WalletService) { }

    @Get('/balance')
    async getBalance(@Req() req: any) {
        return this.walletService.getBalance(req.user.id);
    }

    @Get('/transactions')
    async getTransactions(@Req() req: any) {
        return this.walletService.getTransactions(req.user.id);
    }

    @Post('/topup')
    async createTopUp(@Req() req: any, @Body() dto: TopUpDto) {
        return this.walletService.createTopUp(req.user.id, dto);
    }

    @Post('/payos-webhook')
    async payosWebhook(@Body() body: any) {
        return this.walletService.handleWebhook(body.data || body);
    }
}
