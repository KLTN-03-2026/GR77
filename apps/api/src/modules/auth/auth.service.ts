import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthProvider } from '@prisma/client'
import { AUTH_ERRORS } from '../../common/constants/error-codes'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../../prisma/prisma.service'
import { v4 as uuidv4 } from 'uuid'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { security: true, profile: true }
    })

    if (!user) throw new UnauthorizedException()

    // Chỉ cho phép login bằng mật khẩu nếu account là LOCAL
    if (user.provider !== AuthProvider.LOCAL || !user.password) {
      throw new UnauthorizedException(AUTH_ERRORS.PLEASE_LOGIN_WITH_GOOGLE);
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) throw new UnauthorizedException()

    if (!user.isVerified) {
      throw new UnauthorizedException('EMAIL_NOT_VERIFIED');
    }

    if (user.security?.isLocked) {
      throw new UnauthorizedException(`${AUTH_ERRORS.ACCOUNT_LOCKED}|${user.security.lockReason || 'No reason provided'}`);
    }

    return this.generateTokens(user);
  }

  async googleLogin(googleData: { email: string, googleId: string, name: string, avatarUrl?: string }) {
    const { email, googleId, name, avatarUrl } = googleData;

    // 1. Kiểm tra user tồn tại
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      include: { security: true, profile: true }
    });

    if (existingUser) {
      // 2. Nếu đã liên kết Google trước đó -> Cho phép đăng nhập
      if (existingUser.googleId === googleId) {
        return this.generateTokens(existingUser);
      }

      // 3. Nếu là account LOCAL chưa liên kết -> Báo lỗi yêu cầu đăng nhập trước
      if (existingUser.provider === AuthProvider.LOCAL) {
        throw new ConflictException(AUTH_ERRORS.EMAIL_ALREADY_REGISTERED_LOCAL);
      }

      // Trường hợp Google ID khác nhưng email trùng (hiếm gặp vì googleId unique)
      throw new ConflictException('GOOGLE_ACCOUNT_MISMATCH');
    }

    // 4. Chưa tồn tại -> Tạo mới (Case A trong nghiệp vụ)
    const username = email.split('@')[0];
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        googleId,
        provider: AuthProvider.GOOGLE,
        isVerified: true, // Google đã verify
        security: {
          create: {
            verificationResendCount: 0,
          }
        },
        profile: {
          create: {
            firstName: name.split(' ')[0] || '',
            lastName: name.split(' ').slice(1).join(' ') || '',
            avatarUrl: avatarUrl || null,
          }
        },
        wallet: {
          create: {
            balance: 0
          }
        }
      },
      include: { profile: true }
    });

    return this.generateTokens(user);
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      role: user.role,
      permissions: user.permissions || [],
    }

    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '1h', })
    const refreshToken = await this.issueRefreshToken(user.id)

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profile ? {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          avatarUrl: user.profile.avatarUrl
        } : undefined
      }
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
        { expiresIn: '1h' },
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
}
