import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ParticipantsController } from './participants.controller';
import { ParticipantsService } from './participants.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [PrismaModule, NotificationsModule],
    controllers: [ParticipantsController],
    providers: [ParticipantsService],
})
export class ParticipantsModule { }
