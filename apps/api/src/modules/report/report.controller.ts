import {
    Controller,
    Get,
    Param,
    Patch,
    Body,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { MinRole } from '../auth/roles.decorator';
import { Role, ReportStatus } from '@prisma/client';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@MinRole(Role.ADMIN)
export class ReportController {
    constructor(private readonly reportService: ReportService) {}

    /**
     * GET /reports
     * Lấy tất cả báo cáo. Hỗ trợ query filter:
     *   ?status=PENDING|RESOLVED|DISMISSED
     *   &targetType=campaign|comment
     */
    @Get()
    findAll(
        @Query('status') status?: ReportStatus,
        @Query('targetType') targetType?: 'campaign' | 'comment',
    ) {
        return this.reportService.findAll({ status, targetType });
    }

    /**
     * GET /reports/stats
     * Lấy thống kê: tổng, pending, resolved, dismissed
     */
    @Get('stats')
    getStats() {
        return this.reportService.getStats();
    }

    /**
     * GET /reports/:id
     * Lấy chi tiết 1 báo cáo
     */
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.reportService.findOne(id);
    }

    /**
     * PATCH /reports/:id/status
     * Cập nhật trạng thái báo cáo (resolve / dismiss)
     */
    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateReportStatusDto,
        @Request() req: any,
    ) {
        const adminId = req.user.userId || req.user.sub;
        return this.reportService.updateStatus(id, dto, adminId);
    }
}
