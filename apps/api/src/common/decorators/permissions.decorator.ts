import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export interface RequiredPermission {
  resource: string;
  action: string;
}

/** Declares the permission(s) required to access a route, checked against the caller's RBAC roles. */
export const RequirePermissions = (
  ...permissions: RequiredPermission[]
): MethodDecorator & ClassDecorator =>
  SetMetadata(PERMISSIONS_KEY, permissions);
