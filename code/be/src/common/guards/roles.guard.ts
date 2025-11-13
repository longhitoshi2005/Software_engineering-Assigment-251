import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (!requiredRoles || requiredRoles.length == 0) {
        return true;
      }

      const { user } = context.switchToHttp().getRequest();

      if (!user) {
        throw new ForbiddenException('No user in request');
      }

      const hasRole = requiredRoles.includes(user.role);
      if (!hasRole) {
        throw new ForbiddenException('You do not have permssion to access this resource');
      }

      return true;
  }
}