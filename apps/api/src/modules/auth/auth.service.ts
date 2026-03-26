import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../../prisma/prisma.service'
import { Prisma } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { ConfigService } from '@nestjs/config'
import { MailService } from '../mail/mail.service'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) { }

  async register(dto: RegisterDto) {
    const { email, password, acceptPolicy } = dto;

    // 1) Validate policy acceptance
    if (acceptPolicy !== true) {
      throw new BadRequestException('You must accept the policy to register');
    }

    // 2) Hash password
    const hashed = await bcrypt.hash(password, 10);
    const username = email.split('@')[0];

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Get policy version from config (or default to today's date)
    const policyVersion = this.configService.get<string>('POLICY_VERSION') || new Date().toISOString().split('T')[0];

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

          // Save policy acceptance
          acceptedPolicyAt: new Date(),
          policyVersion,
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

  // ─── Profile Management ────────────────────────────────────

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

    if (data.firstName !== undefined || data.lastName !== undefined) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const first = data.firstName !== undefined ? data.firstName : (user?.firstName || '');
      const last = data.lastName !== undefined ? data.lastName : (user?.lastName || '');
      const fullName = [first, last].filter(Boolean).join(' ');
      if (fullName) updateData.username = fullName;
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true, email: true, username: true,
        firstName: true, lastName: true,
        province: true, district: true, ward: true, address: true,
        avatarUrl: true, coverImageUrl: true, role: true,
      },
    });

    return { message: 'Profile updated successfully.', user: updated };
  }

  // ─── Email Change (2-step) ─────────────────────────────────

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

    await this.prisma.user.update({
      where: { id: userId },
      data: { pendingEmail: newEmail, pendingEmailCode: code, pendingEmailExpires: expires },
    });

    // Generate Action Token for quick revert
    const actionToken = await this.jwtService.signAsync(
      { type: 'REVERT_EMAIL', sub: user.id, oldEmail: user.email, newEmail: newEmail },
      { expiresIn: '7d' } // Link is valid for 7 days
    );

    // Send verification email to the NEW email
    await this.mailService.sendEmailChangeVerification(newEmail, code);
    
    // (Optional) Send security warning to the OLD email
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
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          email: payload.oldEmail,
          pendingEmail: null,
          pendingEmailCode: null,
          pendingEmailExpires: null,
          isLocked: true,
          lockReason: 'Xác nhận nghi ngờ có sự truy cập trái phép. Đã hủy đổi email và khóa tài khoản.',
          lockedAt: new Date(),
        },
      });

      // 2. Invalidate all sessions (Revoke all refresh tokens)
      await this.prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { revoked: true },
      });

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

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('User not found');

      if (!user.isLocked) {
        throw new ConflictException('Tài khoản không bị khóa.');
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Mật khẩu hiện tại không đúng.');
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedNewPassword,
          isLocked: false,
          lockReason: null,
          lockedAt: null,
        },
      });

      return { message: 'Tài khoản đã được mở khóa và đổi mật khẩu thành công.' };
    } catch (e: any) {
      if (e instanceof UnauthorizedException || e instanceof ConflictException) {
        throw e;
      }
      throw new UnauthorizedException('Mã hành động không hợp lệ hoặc đã hết hạn.');
    }
  }

  async verifyEmailChange(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    if (!user.pendingEmail || !user.pendingEmailCode || !user.pendingEmailExpires) {
      throw new UnauthorizedException('Không có yêu cầu đổi email nào.');
    }
    if (new Date() > user.pendingEmailExpires) {
      throw new UnauthorizedException('Mã xác thực đã hết hạn.');
    }
    if (user.pendingEmailCode !== code) {
      throw new UnauthorizedException('Mã xác thực không đúng.');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: user.pendingEmail,
        pendingEmail: null, pendingEmailCode: null, pendingEmailExpires: null,
      },
      select: { id: true, email: true, username: true, firstName: true, lastName: true },
    });

    return { message: 'Email đã được cập nhật thành công.', user: updated };
  }
}
