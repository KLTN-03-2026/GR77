import { Controller, Get, Param, Query, Post, Body, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CampaignsService } from './campaigns.service';
import { GetCampaignsQueryDto } from './dto/get-campaigns-query.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ReportCampaignDto } from './dto/report-campaign.dto';
import { CreateCampaignUpdateDto } from './dto/create-campaign-update.dto';
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
   * POST /campaigns/:id/updates
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/updates')
  postUpdate(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CreateCampaignUpdateDto,
  ) {
    const userId = req.user.userId || req.user.sub;
    return this.campaignsService.postUpdate(userId, id, dto);
  }
}
