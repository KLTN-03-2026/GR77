import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { MinRole } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin-dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@MinRole(Role.ADMIN)
export class AdminDashboardController {
    constructor(private readonly dashboardService: AdminDashboardService) {}

    @Get('stats')
    getStats() {
        return this.dashboardService.getStats();
    }

    @Get('donation-growth')
    getDonationGrowth() {
        return this.dashboardService.getDonationGrowth();
    }

    @Get('fund-allocation')
    getFundAllocation() {
        return this.dashboardService.getFundAllocation();
    }

    @Get('activity-log')
    getActivityLog(@Query('filter') filter?: string) {
        return this.dashboardService.getActivityLog(filter);
    }
}
