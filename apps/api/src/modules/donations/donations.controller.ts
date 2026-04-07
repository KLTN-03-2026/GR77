import { Controller, Post, Body, Get, UseGuards, Req, Param } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('donations')
export class DonationsController {
    constructor(private readonly donationsService: DonationsService) { }

    @Post('/')
    async createDonation(
        @Body() dto: CreateDonationDto,
        @Req() req: any
    ) {
        console.log('Donation request received:', dto);
        const userId = req.user?.id || null;
        return this.donationsService.create(userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/blockchain')
    async recordBlockchainDonation(
        @Body() dto: { campaignId: string, amount: number, txHash: string, walletAddress: string },
        @Req() req: any
    ) {
        const userId = req.user.id;
        return this.donationsService.createBlockchainDonation(userId, dto);
    }

    // PayOS Webhook
    @Post('/payos-webhook')
    async handleWebhook(@Body() webhookBody: any) {
        // PayOS usually sends data directly (without nested WebhookData) in some cases,
        // let's just pass body for now.
        // In production, should use this.payOS.verifyWebhookData(webhookBody)
        const { orderCode, status } = webhookBody.data || webhookBody;
        await this.donationsService.handleWebhook(webhookBody.data || webhookBody);
        return { status: 'ok' };
    }

    @Get('/check-status/:orderId')
    async checkStatus(@Param('orderId') orderId: string) {
        return this.donationsService.checkStatus(orderId);
    }
}
