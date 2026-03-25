import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../../prisma/prisma.service'
import { Prisma } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { ConfigService } from '@nestjs/config'
import { MailService } from '../mail/mail.service'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) { }

  async register(email: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    const username = email.split('@')[0];

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          username,
          password: hashed,
          verificationCode,
          verificationExpires,
          isVerified: false,
          verificationResendCount: 0,
          lastResendAt: new Date(),
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

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) throw new UnauthorizedException()

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) throw new UnauthorizedException()

    if (!user.isVerified) {
      throw new UnauthorizedException('EMAIL_NOT_VERIFIED');
    }

    if (user.isLocked) {
      throw new UnauthorizedException(`ACCOUNT_LOCKED|${user.lockReason || 'No reason provided'}`);
    }

    const payload = {
      sub: user.id,
      role: user.role,
    }

    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m', })

    const refreshToken = await this.issueRefreshToken(user.id)

    return {
      accessToken, refreshToken,
    }
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      })
      const userId = payload.sub as string
      const tokenId = payload.jti as string

      if (!userId || !tokenId) throw new UnauthorizedException()

      const tokenRecord = await this.prisma.refreshToken.findFirst({
        where: {
          id: tokenId,
          userId,
          revoked: false,
          expiresAt: { gt: new Date() },
        },
      })

      if (!tokenRecord) throw new UnauthorizedException()

      const ok = await bcrypt.compare(refreshToken, tokenRecord.tokenHash)
      if (!ok) throw new UnauthorizedException()

      // rotation: revoke token cũ (dùng revoked thay vì delete cho audit)
      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revoked: true },
      })

      const user = await this.prisma.user.findUnique({ where: { id: userId } })
      if (!user) throw new UnauthorizedException()

      const newAccessToken = await this.jwtService.signAsync(
        { sub: user.id, role: user.role },
        { expiresIn: '15m' },
      )

      const newRefreshToken = await this.issueRefreshToken(user.id)

      return { accessToken: newAccessToken, refreshToken: newRefreshToken }
    } catch {
      throw new UnauthorizedException()
    }
  }

  private async issueRefreshToken(userId: string) {
    const tokenId = uuidv4()

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, jti: tokenId },
      {
        expiresIn: '7d',
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      },
    )

    const hashed = await bcrypt.hash(refreshToken, 10)

    await this.prisma.refreshToken.create({
      data: {
        id: tokenId,
        userId,
        tokenHash: hashed,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revoked: false,
      },
    })

    return refreshToken
  }

  async logout(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      })
      const userId = payload.sub as string
      const tokenId = payload.jti as string

      if (!userId || !tokenId) throw new UnauthorizedException()

      const tokenRecord = await this.prisma.refreshToken.findFirst({
        where: { id: tokenId, userId, revoked: false },
      })

      if (!tokenRecord) return

      const ok = await bcrypt.compare(refreshToken, tokenRecord.tokenHash)
      if (!ok) throw new UnauthorizedException()

      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revoked: true },
      })
    } catch {
      return
    }
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    })
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        verificationCode: code,
        verificationExpires: { gt: new Date() }
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationExpires: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new UnauthorizedException('User not found');
    if (user.isVerified) return { message: 'Email already verified' };

    // Check resend limit (5 times)
    if (user.verificationResendCount >= 5) {
      throw new UnauthorizedException('Maximum resend attempts reached. Please contact support.');
    }

    // Check cooldown (60 seconds)
    const now = new Date();
    if (user.lastResendAt) {
      const diff = (now.getTime() - user.lastResendAt.getTime()) / 1000;
      if (diff < 60) {
        throw new UnauthorizedException(`Please wait ${Math.ceil(60 - diff)}s before resending.`);
      }
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationExpires,
        verificationResendCount: user.verificationResendCount + 1,
        lastResendAt: now,
      },
    });

    await this.mailService.sendVerificationEmail(email, verificationCode);

    return {
      message: 'New verification email sent',
      attemptsLeft: 4 - user.verificationResendCount
    };
  }

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

    await this.prisma.user.update({
      where: { id: user.id },
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
        verificationCode: code,
        verificationExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset code.');
    }

    return { message: 'Code verified successfully.' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        verificationCode: code,
        verificationExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset code. Please request a new one.');
    }

    // Check if new password is the same as the current one
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new ConflictException('You have used this password recently. Please choose a different password.');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        verificationCode: null,
        verificationExpires: null,
      },
    });

    return { message: 'Password updated successfully.' };
  }
}
