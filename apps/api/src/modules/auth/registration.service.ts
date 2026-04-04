import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RegistrationService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
    ) { }

    async register(email: string, password: string) {
        const hashed = await bcrypt.hash(password, 10);
        const username = email.split('@')[0];

        // Generate 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        try {
            // 3NF nested create
            const user = await this.prisma.user.create({
                data: {
                    email,
                    username,
                    password: hashed,
                    isVerified: false,
                    security: {
                        create: {
                            verificationCode,
                            verificationExpires,
                            verificationResendCount: 0,
                            lastResendAt: new Date(),
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

            // Send email asynchronously
            this.mailService.sendVerificationEmail(email, verificationCode).catch(err => {
                console.error('Failed to send verification email:', err);
            });

            return { id: user.id, email: user.email, message: 'Verification email sent' };
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

    async verifyEmail(email: string, code: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                email,
                security: {
                    verificationCode: code,
                    verificationExpires: { gt: new Date() }
                }
            },
            include: { security: true }
        });

        if (!user || !user.security) {
            throw new UnauthorizedException('Invalid or expired verification code');
        }

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: user.id },
                data: { isVerified: true },
            }),
            this.prisma.userSecurity.update({
                where: { userId: user.id },
                data: {
                    verificationCode: null,
                    verificationExpires: null,
                },
            })
        ]);

        return { message: 'Email verified successfully' };
    }

    async resendVerification(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { security: true }
        });

        if (!user || !user.security) throw new UnauthorizedException('User not found');
        if (user.isVerified) return { message: 'Email already verified' };

        const security = user.security;

        // Check resend limit (5 times)
        if (security.verificationResendCount >= 5) {
            throw new UnauthorizedException('Maximum resend attempts reached. Please contact support.');
        }

        // Check cooldown (60 seconds)
        const now = new Date();
        if (security.lastResendAt) {
            const diff = (now.getTime() - security.lastResendAt.getTime()) / 1000;
            if (diff < 60) {
                throw new UnauthorizedException(`Please wait ${Math.ceil(60 - diff)}s before resending.`);
            }
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await this.prisma.userSecurity.update({
            where: { userId: user.id },
            data: {
                verificationCode,
                verificationExpires,
                verificationResendCount: security.verificationResendCount + 1,
                lastResendAt: now,
            },
        });

        await this.mailService.sendVerificationEmail(email, verificationCode);

        return {
            message: 'New verification email sent',
            attemptsLeft: 4 - security.verificationResendCount
        };
    }
}
