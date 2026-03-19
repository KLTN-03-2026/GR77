import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService
    ) { }

    async findAll() {
        const users = await this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return users.map(user => ({
            id: user.id,
            name: user.username,
            email: user.email,
            role: user.role === Role.ADMIN ? 'Admin' : (user.role === Role.ORGANIZER ? 'Organizer' : 'Donor'),
            walletAddress: `0x${user.id.slice(0, 8)}`,
            kycStatus: user.isVerified ? 'Verified' : 'Unverified',
            totalContributed: 0,
            createdAt: user.createdAt,
            isLocked: user.isLocked,
        }));
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                createdCampaigns: {
                    orderBy: { createdAt: 'desc' }
                },
                donations: {
                    include: { campaign: true },
                    orderBy: { createdAt: 'desc' }
                },
                participations: {
                    include: { campaign: true },
                    orderBy: { joinedAt: 'desc' }
                },
                reportsReceived: {
                    include: { submitter: true },
                    orderBy: { createdAt: 'desc' }
                },
                actionLogs: {
                    orderBy: { createdAt: 'desc' },
                    take: 50
                }
            }
        });

        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async create(data: { email: string, password?: string, role?: Role, username?: string }) {
        const hashedPassword = await bcrypt.hash(data.password || 'Kindlink@123', 10);
        const username = data.username || data.email.split('@')[0];

        return this.prisma.user.create({
            data: {
                email: data.email,
                username: username,
                password: hashedPassword,
                role: data.role || Role.USER,
                isVerified: true,
            }
        });
    }

    async update(id: string, data: any) {
        const updateData = { ...data };
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        return this.prisma.user.update({
            where: { id },
            data: updateData
        });
    }

    async lock(id: string, reason: string) {
        const user = await this.prisma.user.update({
            where: { id },
            data: {
                isLocked: true,
                lockReason: reason,
                lockedAt: new Date(),
                actionLogs: {
                    create: {
                        action: 'LOCK_USER',
                        details: `Account locked. Reason: ${reason}`
                    }
                }
            }
        });

        // Send notification email
        await this.mailService.sendAccountLockEmail(user.email, reason);

        return user;
    }

    async unlock(id: string) {
        const user = await this.prisma.user.update({
            where: { id },
            data: {
                isLocked: false,
                lockReason: null,
                lockedAt: null,
                actionLogs: {
                    create: {
                        action: 'UNLOCK_USER',
                        details: 'Account unlocked by administrator.'
                    }
                }
            }
        });

        // Send notification email
        await this.mailService.sendAccountUnlockEmail(user.email);

        return user;
    }
}
