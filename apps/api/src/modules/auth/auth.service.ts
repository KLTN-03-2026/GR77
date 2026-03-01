import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../../prisma/prisma.service'
import { Prisma } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async register(email: string, password: string) {
    const hashed = await bcrypt.hash(password, 10)

    try {
      const user = await this.prisma.user.create({
        data: { email, username: email, password: hashed },
      })

      return { id: user.id, email: user.email }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already exists')
      }

      throw error
    }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) throw new UnauthorizedException()

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) throw new UnauthorizedException()

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

      if (!tokenRecord) return // idempotent: logout lại cũng coi như ok

      const ok = await bcrypt.compare(refreshToken, tokenRecord.tokenHash)
      if (!ok) throw new UnauthorizedException()

      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revoked: true },
      })
    } catch {
      // production hay làm logout idempotent: luôn trả 204 để không leak thông tin
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
