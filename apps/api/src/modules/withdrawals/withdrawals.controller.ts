import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';

@Controller('withdrawals')
@UseGuards(JwtAuthGuard)
export class WithdrawalsController {
    constructor(private readonly withdrawalsService: WithdrawalsService) { }

    @Post('/campaign/:id')
    async createRequest(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: CreateWithdrawalDto
    ) {
        return this.withdrawalsService.createRequest(req.user.id, id, dto);
    }

    @Get('/campaign/:id')
    async listForCampaign(
        @Req() req: any,
        @Param('id') id: string
    ) {
        return this.withdrawalsService.listForCampaign(req.user.id, id);
    }
}
