import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PERMISSIONS_KEY, RequiredPermission } from '../decorators/permissions.decorator';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user: AuthenticatedUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    if (user.isSuperAdmin) {
      return true;
    }

    const granted = new Set(user.permissions);
    const hasAll = requiredPermissions.every((required) =>
      granted.has(`${required.resource}:${required.action}`),
    );

    if (!hasAll) {
      throw new ForbiddenException('Insufficient permissions for this operation');
    }

    return true;
  }
}
