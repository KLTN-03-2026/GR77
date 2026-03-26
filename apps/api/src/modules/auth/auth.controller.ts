import { Body, Controller, Post, Get, Patch, UseGuards, Request, HttpCode, Req } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthGuard } from '@nestjs/passport'
import { LogoutDto } from './dto/logout.dto'
import { PrismaService } from '../../prisma/prisma.service'


@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) { }

  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body.email, body.password)
  }

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.email, body.password)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMe(@Request() req) {
    const userId = req.user.sub || req.user.userId;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        location: true,
        avatarUrl: true,
        coverImageUrl: true,
        role: true,
        createdAt: true,
      },
    });
    return user;
  }

  /**
   * PATCH /auth/profile
   * Update profile info (name, phone, location, avatar, cover)
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  async updateProfile(@Request() req, @Body() body: any) {
    const userId = req.user.sub || req.user.userId;
    return this.authService.updateProfile(userId, body);
  }

  /**
   * POST /auth/request-email-change
   * Step 1: Verify password, send OTP to new email
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('request-email-change')
  async requestEmailChange(@Request() req, @Body() body: { newEmail: string; password: string }) {
    const userId = req.user.sub || req.user.userId;
    return this.authService.requestEmailChange(userId, body.newEmail, body.password);
  }

  /**
   * POST /auth/verify-email-change
   * Step 2: Verify OTP and update email in DB
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('verify-email-change')
  async verifyEmailChange(@Request() req, @Body('code') code: string) {
    const userId = req.user.sub || req.user.userId;
    return await this.authService.verifyEmailChange(userId, code);
  }

  @Post('revert-email')
  async revertEmailChange(@Body('token') token: string) {
    return await this.authService.revertEmailChange(token);
  }

  @Post('unlock-account')
  async unlockAccount(@Body() body: any) {
    return await this.authService.unlockAccount(body.token, body.oldPassword, body.newPassword);
  }

  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken)
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Body() dto: LogoutDto) {
    await this.authService.logout(dto.refreshToken)
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout-all')
  @HttpCode(204)
  async logoutAll(@Req() req: any) {
    const userId = req.user.sub || req.user.userId
    await this.authService.logoutAll(userId)
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: { email: string; code: string }) {
    return this.authService.verifyEmail(body.email, body.code);
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerification(body.email);
  }

  @Post('send-reset-code')
  async sendResetCode(@Body() body: { email: string }) {
    return this.authService.sendResetCode(body.email);
  }

  @Post('verify-reset-code')
  async verifyResetCode(@Body() body: { email: string; code: string }) {
    return this.authService.verifyResetCode(body.email, body.code);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; code: string; newPassword: string }) {
    return this.authService.resetPassword(body.email, body.code, body.newPassword);
  }
}
