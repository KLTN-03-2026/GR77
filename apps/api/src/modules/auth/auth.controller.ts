import { Body, Controller, Post, Get, UseGuards, Request, HttpCode, Req } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthGuard } from '@nestjs/passport'
import { LogoutDto } from './dto/logout.dto'


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

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
  getMe(@Request() req) {
    return req.user
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
    // tuỳ bạn set payload trong guard thế nào:
    const userId = req.user.sub || req.user.userId
    await this.authService.logoutAll(userId)
  }
}
