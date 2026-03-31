import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
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
}
