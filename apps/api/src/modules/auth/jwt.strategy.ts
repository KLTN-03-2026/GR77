import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private prisma: PrismaService) {
    const secret = config.get<string>('JWT_ACCESS_SECRET')

    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not defined')
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    })
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { security: true }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.security?.isLocked) {
      throw new UnauthorizedException('ACCOUNT_LOCKED');
    }

    return {
      sub: payload.sub,
      id: payload.sub,
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    }
  }
}
