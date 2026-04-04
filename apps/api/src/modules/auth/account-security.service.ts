import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AccountSecurityService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
        private jwtService: JwtService,
    ) { }

    async requestEmailChange(userId: string, newEmail: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('User not found');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedException('Mật khẩu không đúng.');

        if (user.email === newEmail) throw new ConflictException('Email mới trùng với email hiện tại.');

        const existing = await this.prisma.user.findUnique({ where: { email: newEmail } });
        if (existing) throw new ConflictException('Email này đã được sử dụng.');

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 5 * 60 * 1000);

        await this.prisma.userSecurity.update({
            where: { userId },
            data: { pendingEmail: newEmail, pendingEmailCode: code, pendingEmailExpires: expires },
        });

        // Generate Action Token for quick revert
        const actionToken = await this.jwtService.signAsync(
            { type: 'REVERT_EMAIL', sub: user.id, oldEmail: user.email, newEmail: newEmail },
            { expiresIn: '7d' } // Link is valid for 7 days
        );

        // Send verification email to the NEW email
        await this.mailService.sendEmailChangeVerification(newEmail, code);

        // Send security warning to the OLD email
        await this.mailService.sendSecurityAlertEmail(user.email, newEmail, actionToken);

        return { message: 'Mã xác thực đã được gửi đến email mới.' };
    }

    async revertEmailChange(token: string) {
        try {
            const payload = await this.jwtService.verifyAsync(token);
            if (payload.type !== 'REVERT_EMAIL') {
                throw new Error('Invalid token type');
            }

            const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
            if (!user) throw new UnauthorizedException('User not found');

            // 1. Revert email to oldEmail, clear pending, lock account
            await this.prisma.$transaction([
                this.prisma.user.update({
                    where: { id: user.id },
                    data: { email: payload.oldEmail }
                }),
                this.prisma.userSecurity.update({
                    where: { userId: user.id },
                    data: {
                        pendingEmail: null,
                        pendingEmailCode: null,
                        pendingEmailExpires: null,
                        isLocked: true,
                        lockReason: 'Xác nhận nghi ngờ có sự truy cập trái phép. Đã hủy đổi email và khóa tài khoản.',
                        lockedAt: new Date(),
                    },
                }),
                // 2. Invalidate all sessions (Revoke all refresh tokens)
                this.prisma.refreshToken.updateMany({
                    where: { userId: user.id },
                    data: { revoked: true },
                })
            ]);

            return { message: 'Thay đổi đã được hủy bỏ và tài khoản của bạn đang được khóa an toàn. Bạn sẽ bị đăng xuất khỏi mọi thiết bị.' };
        } catch (e) {
            throw new UnauthorizedException('Mã hành động không hợp lệ hoặc đã hết hạn.');
        }
    }

    async unlockAccount(token: string, oldPassword: string, newPassword: string) {
        try {
            const payload = await this.jwtService.verifyAsync(token);
            if (payload.type !== 'REVERT_EMAIL') {
                throw new Error('Invalid token type');
            }

            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                include: { security: true }
            });
            if (!user) throw new UnauthorizedException('User not found');

            if (!user.security?.isLocked) {
                throw new ConflictException('Tài khoản không bị khóa.');
            }

            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                throw new UnauthorizedException('Mật khẩu hiện tại không đúng.');
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            await this.prisma.$transaction([
                this.prisma.user.update({
                    where: { id: user.id },
                    data: { password: hashedNewPassword }
                }),
                this.prisma.userSecurity.update({
                    where: { userId: user.id },
                    data: {
                        isLocked: false,
                        lockReason: null,
                        lockedAt: null,
                    }
                })
            ]);

            return { message: 'Tài khoản đã được mở khóa và đổi mật khẩu thành công.' };
        } catch (e: any) {
            if (e instanceof UnauthorizedException || e instanceof ConflictException) {
                throw e;
            }
            throw new UnauthorizedException('Mã hành động không hợp lệ hoặc đã hết hạn.');
        }
    }

    async verifyEmailChange(userId: string, code: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { security: true }
        });
        if (!user || !user.security) throw new UnauthorizedException('User not found');

        const security = user.security;
        if (!security.pendingEmail || !security.pendingEmailCode || !security.pendingEmailExpires) {
            throw new UnauthorizedException('Không có yêu cầu đổi email nào.');
        }
        if (new Date() > security.pendingEmailExpires) {
            throw new UnauthorizedException('Mã xác thực đã hết hạn.');
        }
        if (security.pendingEmailCode !== code) {
            throw new UnauthorizedException('Mã xác thực không đúng.');
        }

        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                email: security.pendingEmail,
                security: {
                    update: {
                        pendingEmail: null,
                        pendingEmailCode: null,
                        pendingEmailExpires: null,
                    }
                }
            },
            select: {
                id: true,
                email: true,
                username: true,
                profile: true
            },
        });

        return { message: 'Email đã được cập nhật thành công.', user: updated };
    }
}
