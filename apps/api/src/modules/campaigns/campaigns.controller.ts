import { Controller, Get, Param, Query, Post, Body, UseGuards, Request, Patch, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CampaignsService } from './campaigns.service';
import { GetCampaignsQueryDto } from './dto/get-campaigns-query.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ReportCampaignDto } from './dto/report-campaign.dto';
import { CreateCampaignNewsDto } from './dto/create-campaign-news.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { MinRole } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { AdminPermission } from '../../constants/permissions';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) { }

  /**
   * GET /campaigns/admin
   * 
   * Admin-only list of all campaigns
   */
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @MinRole(Role.ADMIN)
  @RequirePermissions(AdminPermission.CAMPAIGNS_VIEW)
  @Get('admin/all')
  findAllAdmin(@Query() query: GetCampaignsQueryDto) {
    return this.campaignsService.findAllAdmin(query);
  }

  /**
   * POST /campaigns/:id/approve
   */
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @MinRole(Role.ADMIN)
  @RequirePermissions(AdminPermission.CAMPAIGNS_APPROVE)
  @Post(':id/approve')
  approve(@Param('id') id: string, @Request() req: any) {
    const adminId = req.user.userId || req.user.sub;
    return this.campaignsService.approve(id, adminId);
  }

  /**
   * POST /campaigns/:id/reject
   */
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @MinRole(Role.ADMIN)
  @RequirePermissions(AdminPermission.CAMPAIGNS_APPROVE)
  @Post(':id/reject')
  reject(@Param('id') id: string, @Request() req: any, @Body('note') note: string) {
    const adminId = req.user.userId || req.user.sub;
    return this.campaignsService.reject(id, adminId, note || 'No reason provided');
  }

  /**
   * POST /campaigns/:id/close
   */
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @MinRole(Role.ADMIN)
  @RequirePermissions(AdminPermission.CAMPAIGNS_APPROVE)
  @Post(':id/close')
  close(@Param('id') id: string, @Request() req: any) {
    const adminId = req.user.userId || req.user.sub;
    return this.campaignsService.close(id, adminId);
  }

  /**
   * GET /campaigns
   * 
   * Public list of active campaigns
   * If authenticated, each campaign includes isFavorited boolean
   */
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  list(@Query() query: GetCampaignsQueryDto, @Request() req: any) {
    const userId = req.user?.userId || req.user?.sub || null;
    return this.campaignsService.list(query, userId);
  }

  /**
   * GET /campaigns/me/stats
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('me/stats')
  getMyStats(@Request() req: any) {
    const userId = req.user.userId || req.user.sub;
    return this.campaignsService.getMyStats(userId);
  }

  /**
   * GET /campaigns/me/list
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('me/list')
  listMine(@Request() req: any) {
    const userId = req.user.userId || req.user.sub;
    return this.campaignsService.listMine(userId);
  }

  /**
   * GET /campaigns/:id
   */
  @Get(':id')
  detail(@Param('id') id: string) {
    return this.campaignsService.detail(id);
  }

  /**
   * GET /campaigns/:id/transparency
   * Returns public ledger entries (donations and withdrawals)
   */
  @Get(':id/transparency')
  getTransparency(@Param('id') id: string) {
    return this.campaignsService.getTransparency(id);
  }

  /**
   * GET /campaigns/:id/participants
   * Returns list of participants
   */
  @Get(':id/participants')
  getParticipants(@Param('id') id: string) {
    return this.campaignsService.getParticipants(id);
  }

  /**
   * POST /campaigns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req: any, @Body() createCampaignDto: CreateCampaignDto) {
    const userId = req.user.userId || req.user.sub;
    return this.campaignsService.create(userId, createCampaignDto);
  }

  /**
   * PATCH /campaigns/:id
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    const userId = req.user.userId || req.user.sub;
    return this.campaignsService.update(userId, id, updateCampaignDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/report')
  report(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ReportCampaignDto,
  ) {
    const userId = req.user.userId || req.user.sub;
    return this.campaignsService.report(userId, id, dto);
  }

  /**
   * POST /campaigns/:id/news
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/news')
  postNews(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CreateCampaignNewsDto,
  ) {
    const userId = req.user.userId || req.user.sub;
    return this.campaignsService.postNews(userId, id, dto);
  }

  /**
   * GET /campaigns/admin/news
   * [ADMIN] Lấy toàn bộ campaign news để kiểm duyệt nội dung
   */
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @MinRole(Role.ADMIN)
  @RequirePermissions(AdminPermission.COMMENTS_MANAGE)
  @Get('admin/news')
  findAllNewsAdmin(
    @Query('q') q?: string,
    @Query('campaignId') campaignId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.campaignsService.findAllNewsAdmin({
      q,
      campaignId,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  /**
   * DELETE /campaigns/admin/news/:id
   * [ADMIN] Xóa bài cập nhật vi phạm
   */
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @MinRole(Role.ADMIN)
  @RequirePermissions(AdminPermission.COMMENTS_MANAGE)
  @Delete('admin/news/:id')
  adminDeleteNews(@Request() req: any, @Param('id') id: string) {
    const adminId = req.user.userId || req.user.sub;
    return this.campaignsService.adminDeleteNews(id, adminId);
  }
}
