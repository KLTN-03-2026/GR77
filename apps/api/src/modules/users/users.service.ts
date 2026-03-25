import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';

/** Role hierarchy level */
const ROLE_LEVEL: Record<Role, number> = {
    [Role.USER]: 0,
    [Role.ORGANIZER]: 1,
    [Role.ADMIN]: 2,
    [Role.SUPER_ADMIN]: 3,
};

function mapRoleLabel(role: Role): string {
    const map: Record<Role, string> = {
        [Role.USER]: 'Donor',
        [Role.ORGANIZER]: 'Organizer',
        [Role.ADMIN]: 'Admin',
        [Role.SUPER_ADMIN]: 'Super Admin',
    };
    return map[role];
}

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
    ) { }

    /**
     * Lấy danh sách người dùng theo quyền của caller:
     * - ADMIN: chỉ thấy USER & ORGANIZER (không thấy ADMIN, SUPER_ADMIN)
     * - SUPER_ADMIN: thấy tất cả trừ chính mình
     */
    async findAll(currentUserId: string, callerRole: Role) {
        const roleFilter: Prisma.UserWhereInput = callerRole === Role.SUPER_ADMIN
            ? { id: { not: currentUserId } }                          // thấy tất cả trừ chính mình
            : { id: { not: currentUserId }, role: { in: [Role.USER, Role.ORGANIZER] } }; // ADMIN chỉ thấy non-admin

        const users = await this.prisma.user.findMany({
            where: roleFilter,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isVerified: true,
                isLocked: true,
                createdAt: true,
            },
        });

        return users.map((user) => ({
            id: user.id,
            name: user.username,
            email: user.email,
            role: mapRoleLabel(user.role),
            rawRole: user.role,
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
                createdCampaigns: { orderBy: { createdAt: 'desc' } },
                donations: { include: { campaign: true }, orderBy: { createdAt: 'desc' } },
                participations: { include: { campaign: true }, orderBy: { joinedAt: 'desc' } },
                reportsReceived: { include: { submitter: true }, orderBy: { createdAt: 'desc' } },
                actionLogs: { orderBy: { createdAt: 'desc' }, take: 50 },
            },
        });

        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    /**
     * Admin tạo tài khoản mới → bắt buộc verify email.
     * Chỉ SUPER_ADMIN mới được tạo tài khoản ADMIN/SUPER_ADMIN.
     */
    async create(
        data: { email: string; password?: string; role?: Role; username?: string },
        callerRole: Role,
    ) {
        // Phân quyền: ADMIN chỉ được tạo USER/ORGANIZER
        const targetRole = data.role || Role.USER;
        if (
            ROLE_LEVEL[targetRole] >= ROLE_LEVEL[Role.ADMIN] &&
            callerRole !== Role.SUPER_ADMIN
        ) {
            throw new ForbiddenException(
                'Only Super Admin can create Admin or Super Admin accounts.',
            );
        }

        const password = data.password || 'Kindlink@123';
        const hashedPassword = await bcrypt.hash(password, 10);
        const username = data.username || data.email.split('@')[0];

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 5 * 60 * 1000);

        try {
            const user = await this.prisma.user.create({
                data: {
                    email: data.email,
                    username,
                    password: hashedPassword,
                    role: targetRole,
                    isVerified: false,
                    verificationCode,
                    verificationExpires,
                    verificationResendCount: 0,
                    lastResendAt: new Date(),
                },
            });

            this.mailService.sendVerificationEmail(data.email, verificationCode).catch((err) => {
                console.error('Failed to send verification email:', err);
            });

            return {
                id: user.id,
                email: user.email,
                message: 'Verification email sent. User must verify their email before logging in.',
            };
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('Email already exists');
            }
            throw error;
        }
    }

    /**
     * Nâng role người dùng lên ADMIN.
     * Chỉ SUPER_ADMIN được thực hiện.
     * Không thể thay đổi role của SUPER_ADMIN.
     */
    async upgradeToAdmin(targetId: string, callerId: string) {
        const target = await this.prisma.user.findUnique({ where: { id: targetId } });
        if (!target) throw new NotFoundException('User not found');

        if (target.role === Role.SUPER_ADMIN) {
            throw new ForbiddenException('Cannot change the role of a Super Admin account.');
        }
        if (target.id === callerId) {
            throw new ForbiddenException('Cannot modify your own account role.');
        }

        return this.prisma.user.update({
            where: { id: targetId },
            data: {
                role: Role.ADMIN,
                actionLogs: {
                    create: {
                        action: 'UPGRADE_ROLE',
                        details: `Role upgraded to ADMIN by Super Admin (callerId: ${callerId}).`,
                    },
                },
            },
        });
    }

    /**
     * Khóa tài khoản.
     * ADMIN: chỉ khoá được USER & ORGANIZER.
     * SUPER_ADMIN: khoá được cả ADMIN (không khoá SUPER_ADMIN khác).
     */
    async lock(targetId: string, reason: string, callerId: string, callerRole: Role) {
        const target = await this.prisma.user.findUnique({ where: { id: targetId } });
        if (!target) throw new NotFoundException('User not found');

        this.assertCanManage(callerRole, callerId, target);

        const user = await this.prisma.user.update({
            where: { id: targetId },
            data: {
                isLocked: true,
                lockReason: reason,
                lockedAt: new Date(),
                actionLogs: {
                    create: {
                        action: 'LOCK_USER',
                        details: `Account locked. Reason: ${reason}`,
                    },
                },
            },
        });

        await this.mailService.sendAccountLockEmail(user.email, reason);
        return user;
    }

    /**
     * Mở khoá tài khoản – quy tắc tương tự như lock.
     */
    async unlock(targetId: string, callerId: string, callerRole: Role) {
        const target = await this.prisma.user.findUnique({ where: { id: targetId } });
        if (!target) throw new NotFoundException('User not found');

        this.assertCanManage(callerRole, callerId, target);

        const user = await this.prisma.user.update({
            where: { id: targetId },
            data: {
                isLocked: false,
                lockReason: null,
                lockedAt: null,
                actionLogs: {
                    create: {
                        action: 'UNLOCK_USER',
                        details: 'Account unlocked by administrator.',
                    },
                },
            },
        });

        await this.mailService.sendAccountUnlockEmail(user.email);
        return user;
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
}
