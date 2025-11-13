// src/common/guards/jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. nếu route/method được đánh @Public() thì bỏ qua
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // 2. ngược lại: bắt buộc phải có token
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'];

    if (!auth || typeof auth !== 'string') {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [type, token] = auth.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization format');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'dev-secret',
      });
      req.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
