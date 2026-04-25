import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        userId: string;
        title: string;
        message: string;
        type: string;
        link?: string;
    }) {
        return this.prisma.notification.create({
            data,
        });
    }

    async findAll(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }

    async markAsRead(id: string) {
        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }

    async notifyAdmins(data: { title: string; message: string; type: string; link?: string }, requiredPermission?: string) {
        const users = await this.prisma.user.findMany({
            where: {
                OR: [
                    { role: 'SUPER_ADMIN' },
                    {
                        role: 'ADMIN',
                        ...(requiredPermission ? { permissions: { has: requiredPermission } } : {})
                    }
                ]
            },
        });

        return Promise.all(
            users.map((u) =>
                this.create({
                    userId: u.id,
                    ...data,
                }),
            ),
        );
    }
}
