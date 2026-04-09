import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { Prisma } from '@prisma/client';
import { AUTH_ERRORS } from '../../common/constants/error-codes'

@Injectable()
export class RegistrationService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
    ) { }

    private pendingUsers = new Map<string, any>();

    async register(email: string, password: string) {
        // Check if user already exists in DB
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new ConflictException(AUTH_ERRORS.EMAIL_ALREADY_EXISTS);
        }

        const hashed = await bcrypt.hash(password, 10);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Store registration temporarily in memory
        this.pendingUsers.set(email, {
            passwordHash: hashed,
            verificationCode,
            verificationExpires,
            verificationResendCount: 0,
            lastResendAt: new Date()
        });

        // Send email asynchronously
        this.mailService.sendVerificationEmail(email, verificationCode).catch(err => {
            console.error('Failed to send verification email:', err);
        });

        return { message: 'Verification email sent' };
    }

    async verifyEmail(email: string, code: string) {
        // Check pending users
        const pending = this.pendingUsers.get(email);
        if (!pending) {
            throw new UnauthorizedException('Invalid or expired verification code');
        }

        if (pending.verificationCode !== code) {
            throw new UnauthorizedException('Invalid verification code');
        }

        if (pending.verificationExpires < new Date()) {
            this.pendingUsers.delete(email);
            throw new UnauthorizedException('Verification code expired');
        }

        const username = email.split('@')[0];

        // Ensure email doesn't exist yet before final creation
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            this.pendingUsers.delete(email);
            throw new ConflictException(AUTH_ERRORS.EMAIL_ALREADY_EXISTS);
        }

        // Verify successful, create user in DB!
        const user = await this.prisma.user.create({
            data: {
                email,
                username,
                password: pending.passwordHash,
                isVerified: true,
                security: {
                    create: {
                        verificationResendCount: 0,
                    }
                },
                profile: {
                    create: {} // Default empty profile
                },
                wallet: {
                    create: {
                        balance: 0
                    }
                }
            },
        });

        // Remove from pending
        this.pendingUsers.delete(email);

        return { message: 'Email verified successfully' };
    }

    async resendVerification(email: string) {
        const pending = this.pendingUsers.get(email);

        if (!pending) {
            const existingUser = await this.prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return { message: 'Email already verified' };
            }
            throw new UnauthorizedException('User not found in pending registration');
        }

        // Check resend limit (5 times)
        if (pending.verificationResendCount >= 5) {
            throw new UnauthorizedException('Maximum resend attempts reached. Please register again.');
        }

        // Check cooldown (60 seconds)
        const now = new Date();
        const diff = (now.getTime() - pending.lastResendAt.getTime()) / 1000;
        if (diff < 60) {
            throw new UnauthorizedException(`Please wait ${Math.ceil(60 - diff)}s before resending.`);
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Update pending memory object
        pending.verificationCode = verificationCode;
        pending.verificationExpires = verificationExpires;
        pending.verificationResendCount++;
        pending.lastResendAt = now;

        await this.mailService.sendVerificationEmail(email, verificationCode);

        return {
            message: 'New verification email sent',
            attemptsLeft: 4 - pending.verificationResendCount
        };
    }
}
