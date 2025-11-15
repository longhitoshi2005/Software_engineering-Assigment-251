// src/controllers/auth.controller.ts
import { Body, Controller, Get, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../schemas';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('google')
  async googleLogin(@Body('idToken') idToken: string) {
    const result = await this.authService.verifyGoogleToken(idToken);
    return {
      success: true,
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Public()
  @Post('dev-login')
  async devLogin(
    @Body('secret') secret: string,
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('role') role: Role = Role.STUDENT,
  ) {
    // 1. check secret
    if (secret !== process.env.DEV_AUTH_SECRET) {
      throw new UnauthorizedException('Invalid dev secret');
    }

    // 2. gọi service để tạo/tìm user + ký JWT
    const result = await this.authService.devLogin({ email, name, role });

    return {
      success: true,
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Get('me')
  async me(@CurrentUser() user: any) {
    return { user };
  }
}
