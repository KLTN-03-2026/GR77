import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';

const ROLE_LEVEL: Record<Role, number> = {
    [Role.USER]: 1,
    [Role.ORGANIZER]: 2,
    [Role.ADMIN]: 3,
    [Role.SUPER_ADMIN]: 4,
};

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService
    ) { }

    async findAll(callerId: string, callerRole: Role, roleGroup?: 'ADMINS' | 'MEMBERS') {
        let where: Prisma.UserWhereInput = { id: { not: callerId } };

        if (callerRole === Role.ADMIN) {
            // Admin only sees USER and ORGANIZER
            where.role = { in: [Role.USER, Role.ORGANIZER] };
        } else if (callerRole === Role.SUPER_ADMIN) {
            if (roleGroup === 'ADMINS') {
                where.role = { in: [Role.ADMIN, Role.SUPER_ADMIN] };
            } else if (roleGroup === 'MEMBERS') {
                where.role = { in: [Role.USER, Role.ORGANIZER] };
            }
        }

        return this.prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                permissions: true,
                isVerified: true,
                createdAt: true,
                profile: true,
                security: {
                    select: {
                        isLocked: true,
                        lockReason: true,
                        lockedAt: true
                    }
                }
            } as any,
        });
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                profile: true,
                wallet: true,
                security: true
            }
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async create(data: any, callerRole: Role) {
        const { email, password, role } = data;
        const targetRole = role || Role.USER;

        // Check if email already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            throw new ConflictException('Email này đã được sử dụng trên hệ thống.');
        }

        // Security check: cannot create role higher than own
        if (ROLE_LEVEL[callerRole] <= ROLE_LEVEL[targetRole] && callerRole !== Role.SUPER_ADMIN) {
            throw new ForbiddenException('Cannot create user with equal or higher role.');
        }

        const rawPassword = password || 'Kindlink@123';
        const hashed = await bcrypt.hash(rawPassword, 10);
        const username = email.split('@')[0];

        const user = await this.prisma.user.create({
            data: {
                email,
                username,
                password: hashed,
                role: targetRole,
                isVerified: true, // Admin created users are pre-verified
                profile: { create: {} },
                wallet: { create: { balance: 0 } },
                security: { create: {} }
            }
        });

        // Send invitation email with account details
        try {
            await this.mailService.sendAccountInvitation(email, rawPassword, targetRole);
        } catch (error) {
            console.error('Failed to send invitation email:', error);
            // We don't throw here to avoid failing user creation if email fails
        }

        return user;
    }

    async upgradeToAdmin(id: string, callerId: string, callerRole: Role) {
        const target = await this.findOne(id);

        this.assertCanManage(callerRole, callerId, target);

        return this.prisma.user.update({
            where: { id },
            data: { role: Role.ADMIN },
        });
    }

    async lock(id: string, reason: string, callerId: string, callerRole: Role) {
        const target = await this.findOne(id);
        this.assertCanManage(callerRole, callerId, target);

        const result = await this.prisma.userSecurity.update({
            where: { userId: id },
            data: {
                isLocked: true,
                lockReason: reason,
                lockedAt: new Date(),
            },
        });

        // Notify user via email
        try {
            await this.mailService.sendAccountLockEmail(target.email, reason);
        } catch (error) {
            console.error('Failed to send lock email notification:', error);
        }

        return result;
    }

    async unlock(id: string, callerId: string, callerRole: Role) {
        const target = await this.findOne(id);
        this.assertCanManage(callerRole, callerId, target);

        const result = await this.prisma.userSecurity.update({
            where: { userId: id },
            data: {
                isLocked: false,
                lockReason: null,
                lockedAt: null,
            },
        });

        // Notify user via email
        try {
            await this.mailService.sendAccountUnlockEmail(target.email);
        } catch (error) {
            console.error('Failed to send unlock email notification:', error);
        }

        return result;
    }

    // ── Private helpers ──────────────────────────────────────────

    private assertCanManage(
        callerRole: Role,
        callerId: string,
        target: { id: string; role: Role },
    ) {
        if (target.id === callerId) {
            throw new ForbiddenException('Cannot modify your own account.');
        }

        const callerLevel = ROLE_LEVEL[callerRole];
        const targetLevel = ROLE_LEVEL[target.role];

        // Caller phải có level cao hơn target
        if (callerLevel <= targetLevel) {
            throw new ForbiddenException(
                'You do not have sufficient privileges to manage this account.',
            );
        }
    }

    // ── Profile Management ────────────────────────────────────

    async updateProfile(userId: string, data: {
        firstName?: string;
        lastName?: string;
        province?: string;
        district?: string;
        ward?: string;
        address?: string;
        avatarUrl?: string;
        coverImageUrl?: string;
    }) {
        const updateData: any = {};
        if (data.firstName !== undefined) updateData.firstName = data.firstName;
        if (data.lastName !== undefined) updateData.lastName = data.lastName;
        if (data.province !== undefined) updateData.province = data.province;
        if (data.district !== undefined) updateData.district = data.district;
        if (data.ward !== undefined) updateData.ward = data.ward;
        if (data.address !== undefined) updateData.address = data.address;
        if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
        if (data.coverImageUrl !== undefined) updateData.coverImageUrl = data.coverImageUrl;

        // Auto-update username if first/last name changed
        if (data.firstName !== undefined || data.lastName !== undefined) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { profile: true }
            });
            const first = data.firstName !== undefined ? data.firstName : (user?.profile?.firstName || '');
            const last = data.lastName !== undefined ? data.lastName : (user?.profile?.lastName || '');
            const fullName = [first, last].filter(Boolean).join(' ');
            if (fullName) {
                await this.prisma.user.update({
                    where: { id: userId },
                    data: { username: fullName }
                });
            }
        }

        await this.prisma.userProfile.upsert({
            where: { userId },
            update: updateData,
            create: {
                userId,
                firstName: updateData.firstName,
                lastName: updateData.lastName,
                province: updateData.province,
                district: updateData.district,
                ward: updateData.ward,
                address: updateData.address,
                avatarUrl: updateData.avatarUrl,
                coverImageUrl: updateData.coverImageUrl,
            }
        });

        const updatedUser = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                wallet: {
                    select: {
                        balance: true,
                        walletAddress: true
                    }
                },
                security: {
                    select: {
                        isLocked: true,
                        lockReason: true
                    }
                }
            }
        });

        return { message: 'Profile updated successfully.', user: updatedUser };
    }

    async updatePermissions(id: string, permissions: string[], callerId: string, callerRole: Role) {
        const target = await this.findOne(id);

        // Chỉ Super Admin mới có quyền phân quyền
        if (callerRole !== Role.SUPER_ADMIN) {
            throw new ForbiddenException('Only Super Admin can manage permissions.');
        }

        return this.prisma.user.update({
            where: { id },
            data: {
                permissions: {
                    set: permissions
                }
            }
        });
    }
}
