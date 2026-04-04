import { Controller, Get, Post, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    findAll(@Request() req: any) {
        const userId = req.user.userId || req.user.sub;
        return this.notificationsService.findAll(userId);
    }

    @Patch(':id/read')
    markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Post('read-all')
    markAllAsRead(@Request() req: any) {
        const userId = req.user.userId || req.user.sub;
        return this.notificationsService.markAllAsRead(userId);
    }
}
