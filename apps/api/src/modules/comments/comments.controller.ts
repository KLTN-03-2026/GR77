import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { MinRole } from '../auth/roles.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { AdminPermission } from '../../constants/permissions';
import { Role } from '@prisma/client';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ReportCommentDto } from './dto/report-comment.dto';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Get('campaign/:campaignId')
    findAllByCampaign(@Param('campaignId') campaignId: string) {
        return this.commentsService.findAllByCampaign(campaignId);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Request() req: any, @Body() dto: CreateCommentDto) {
        const userId = req.user.userId || req.user.sub;
        return this.commentsService.create(userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        const userId = req.user.userId || req.user.sub;
        return this.commentsService.remove(userId, id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/report')
    report(@Request() req: any, @Param('id') id: string, @Body() dto: ReportCommentDto) {
        const userId = req.user.userId || req.user.sub;
        return this.commentsService.report(userId, id, dto);
    }

    /**
     * GET /comments/admin
     * [ADMIN] Lấy toàn bộ comment để kiểm duyệt nội dung
     */
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @MinRole(Role.ADMIN)
    @RequirePermissions(AdminPermission.COMMENTS_MANAGE)
    @Get('admin')
    findAllAdmin(
        @Query('q') q?: string,
        @Query('campaignId') campaignId?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.commentsService.findAllAdmin({
            q,
            campaignId,
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
    }

    /**
     * DELETE /comments/admin/:id
     * [ADMIN] Xóa bất kỳ comment nào (bypass ownership)
     */
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @MinRole(Role.ADMIN)
    @RequirePermissions(AdminPermission.COMMENTS_MANAGE)
    @Delete('admin/:id')
    adminRemove(@Request() req: any, @Param('id') id: string) {
        const adminId = req.user.userId || req.user.sub;
        return this.commentsService.adminRemove(id, adminId);
    }
}
