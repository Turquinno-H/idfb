import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.interface';

/**
 * Resolves the active company (tenant) id from the authenticated user.
 * Throws when the account has no active company context selected, which
 * guarantees that tenant-scoped handlers can never run without a tenant.
 */
export const TenantCompanyId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    const companyId = request.user?.companyId;
    if (!companyId) {
      throw new ForbiddenException(
        'No active company context. Please select a company first.',
      );
    }
    return companyId;
  },
);
