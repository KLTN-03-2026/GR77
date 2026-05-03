import { Controller, Post, Body, Get, UseGuards, Req, Param, Query } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Roles } from '../auth/roles.decorator';
import { RequirePermissions } from '../auth/permissions.decorator';
import { Role } from '@prisma/client';
import { AdminPermission } from '../../constants/permissions';

@Controller('donations')
export class DonationsController {
    constructor(private readonly donationsService: DonationsService) { }

    @UseGuards(OptionalJwtAuthGuard)
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
        @Body() dto: { campaignId: string, amount: number, txHash: string, walletAddress: string, message?: string, isAnonymous?: boolean },
        @Req() req: any
    ) {
        const userId = req.user.id;
        console.log('Blockchain donation request:', { userId, dto });
        return this.donationsService.createBlockchainDonation(userId, dto);
    }

    // PayOS Webhook
    @Post('/payos-webhook')
    async handleWebhook(@Body() webhookBody: any) {
        // Pass the full webhook body to retain `code` and `success` root properties
        await this.donationsService.handleWebhook(webhookBody);
        return { status: 'ok' };
    }

    @Get('/check-status/:orderId')
    async checkStatus(@Param('orderId') orderId: string) {
        return this.donationsService.checkStatus(orderId);
    }

    /** Admin: Lấy toàn bộ donations (filter theo status, paymentMethod) */
    @Get('/admin/all')
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    @RequirePermissions(AdminPermission.TRANSACTIONS_VIEW)
    async adminListAll(
        @Query('status') status?: string,
        @Query('method') method?: string,
        @Query('campaignId') campaignId?: string,
    ) {
        return this.donationsService.adminListAll({ status, method, campaignId });
    }

    @Get('/debug/hashes')
    async debugHashes() {
        return this.donationsService.getDebugHashes();
    }
}
