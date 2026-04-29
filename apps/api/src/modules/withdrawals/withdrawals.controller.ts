import {
    Controller, Post, Get, Patch, Body, Param, Req,
    UseGuards, Query
} from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Roles } from '../auth/roles.decorator';
import { RequirePermissions } from '../auth/permissions.decorator';
import { Role } from '@prisma/client';
import { AdminPermission } from '../../constants/permissions';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { ApproveWithdrawalDto } from './dto/approve-withdrawal.dto';
import { RejectWithdrawalDto } from './dto/reject-withdrawal.dto';

@Controller('withdrawals')
@UseGuards(JwtAuthGuard)
export class WithdrawalsController {
    constructor(private readonly withdrawalsService: WithdrawalsService) { }

    // ── CREATOR endpoints ──────────────────────────────────────────────────

    /** Tạo yêu cầu rút tiền cho campaign */
    @Post('/campaign/:id')
    async createRequest(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: CreateWithdrawalDto,
    ) {
        return this.withdrawalsService.createRequest(req.user.id, id, dto);
    }

    /** Lấy danh sách yêu cầu rút tiền của một campaign (chỉ creator) */
    @Get('/campaign/:id')
    async listForCampaign(@Req() req: any, @Param('id') id: string) {
        return this.withdrawalsService.listForCampaign(req.user.id, id);
    }

    // ── ADMIN endpoints ────────────────────────────────────────────────────

    /** Admin: Lấy toàn bộ yêu cầu rút tiền (có thể filter theo status) */
    @Get('/admin/all')
    @UseGuards(RolesGuard, PermissionsGuard)
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    @RequirePermissions(AdminPermission.WITHDRAWALS_APPROVE)
    async adminListAll(@Query('status') status?: string) {
        return this.withdrawalsService.adminListAll(status);
    }

    /** Admin: Xem chi tiết một yêu cầu */
    @Get('/admin/:id')
    @UseGuards(RolesGuard, PermissionsGuard)
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    @RequirePermissions(AdminPermission.WITHDRAWALS_APPROVE)
    async findOne(@Param('id') id: string) {
        return this.withdrawalsService.findOne(id);
    }

    /** Admin: Phê duyệt yêu cầu rút tiền */
    @Patch('/admin/:id/approve')
    @UseGuards(RolesGuard, PermissionsGuard)
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    @RequirePermissions(AdminPermission.WITHDRAWALS_APPROVE)
    async approve(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: ApproveWithdrawalDto,
    ) {
        return this.withdrawalsService.approve(req.user.id, id, dto);
    }

    /** Admin: Từ chối yêu cầu rút tiền */
    @Patch('/admin/:id/reject')
    @UseGuards(RolesGuard, PermissionsGuard)
    @Roles(Role.ADMIN, Role.SUPER_ADMIN)
    @RequirePermissions(AdminPermission.WITHDRAWALS_APPROVE)
    async reject(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: RejectWithdrawalDto,
    ) {
        return this.withdrawalsService.reject(req.user.id, id, dto);
    }
}
