// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// dùng: @Roles('admin', 'tutor')
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
