import { Controller, Get, Post, Body, UseGuards, Request, Patch, Param, Query, ForbiddenException } from '@nestjs/common';
import { EkycService } from './ekyc.service';
import { VerifyEkycDto } from './dto/verify-ekyc.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('ekyc')
@UseGuards(JwtAuthGuard)
export class EkycController {
    constructor(private readonly ekycService: EkycService) { }

    @Get('status')
    async getStatus(@Request() req) {
        return this.ekycService.getStatus(req.user.id);
    }

    // Alternative method name to fix typo
    @Get('my-status')
    async getMyStatus(@Request() req) {
        return this.ekycService.getStatus(req.user.id);
    }

    @Post('verify')
    async verify(@Request() req, @Body() dto: VerifyEkycDto) {
        return this.ekycService.submitVerification(req.user.id, dto);
    }

    // Admin endpoints
    @Get('pending')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    async getAll(@Query('status') status?: string) {
        return this.ekycService.getAll(status);
    }

    @Patch('approve/:userId')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    async approve(@Param('userId') userId: string) {
        return this.ekycService.approve(userId);
    }

    @Patch('reject/:userId')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    async reject(@Param('userId') userId: string, @Body('reason') reason: string) {
        return this.ekycService.reject(userId, reason);
    }
}
