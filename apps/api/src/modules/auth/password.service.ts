import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PasswordService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
    ) { }

    async sendResetCode(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('No account found with this email address.');
        }

        if (!user.isVerified) {
            throw new UnauthorizedException('Please verify your email before resetting your password.');
        }

        // Generate 6-digit reset code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await this.prisma.userSecurity.update({
            where: { userId: user.id },
            data: {
                verificationCode: resetCode,
                verificationExpires: resetExpires,
            },
        });

        // Send email
        await this.mailService.sendPasswordResetEmail(email, resetCode);

        return { message: 'Password reset code sent to your email.' };
    }

    async verifyResetCode(email: string, code: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                email,
                security: {
                    verificationCode: code,
                    verificationExpires: { gt: new Date() },
                }
            },
            include: { security: true }
        });

        if (!user || !user.security) {
            throw new UnauthorizedException('Invalid or expired reset code.');
        }

        return { message: 'Code verified successfully.' };
    }

    async resetPassword(email: string, code: string, newPassword: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                email,
                security: {
                    verificationCode: code,
                    verificationExpires: { gt: new Date() },
                }
            },
            include: { security: true }
        });

        if (!user || !user.security) {
            throw new UnauthorizedException('Invalid or expired reset code. Please request a new one.');
        }

        // Check if new password is the same as the current one
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            throw new ConflictException('You have used this password recently. Please choose a different password.');
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: user.id },
                data: { password: hashed }
            }),
            this.prisma.userSecurity.update({
                where: { userId: user.id },
                data: {
                    verificationCode: null,
                    verificationExpires: null,
                }
            })
        ]);

        return { message: 'Password updated successfully.' };
    }
}
