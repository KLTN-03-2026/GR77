import {
    Controller,
    Post,
    Delete,
    Get,
    Param,
    Body,
    Req,
    Query,
    UseGuards,
    UnauthorizedException,
} from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { JoinCampaignDto } from './dto/join-campaign.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

/**
 * ParticipantsController
 * 
 * Quản lý việc tham gia/rời khỏi chiến dịch.
 * Yêu cầu đăng nhập (JwtAuthGuard).
 */
@Controller('participants')
@UseGuards(JwtAuthGuard)
export class ParticipantsController {
    constructor(private readonly participantsService: ParticipantsService) { }

    private getUserId(req: any): string {
        const userId = req?.user?.userId ?? req?.user?.sub ?? req?.user?.id;
        if (!userId) throw new UnauthorizedException();
        return userId;
    }

    /**
     * POST /participants
     * Tham gia một chiến dịch
     */
    @Post()
    join(@Req() req: any, @Body() body: JoinCampaignDto) {
        const userId = this.getUserId(req);
        return this.participantsService.join(userId, body.campaignId);
    }

    /**
     * DELETE /participants/:campaignId
     * Rời khỏi chiến dịch
     */
    @Delete(':campaignId')
    leave(@Req() req: any, @Param('campaignId') campaignId: string) {
        const userId = this.getUserId(req);
        return this.participantsService.leave(userId, campaignId);
    }

    /**
     * GET /participants/me
     * Danh sách chiến dịch tôi tham gia
     * ?page=1&limit=20
     */
    @Get('me')
    listMine(
        @Req() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const userId = this.getUserId(req);
        return this.participantsService.listMine(
            userId,
            page ? Number(page) : 1,
            limit ? Number(limit) : 20,
        );
    }

    /**
     * GET /participants/:campaignId/status
     * Kiểm tra xem user này đã tham gia campaign chưa
     */
    @Get(':campaignId/status')
    getStatus(@Req() req: any, @Param('campaignId') campaignId: string) {
        const userId = this.getUserId(req);
        return this.participantsService.getStatus(userId, campaignId);
    }
}
