import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import type { Request } from 'express';
import { Prisma } from '@idfb/database';
import { AuditService } from '../../modules/audit/audit.service';
import { AUDIT_KEY, AuditMetadata } from '../decorators/audit.decorator';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.interface';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metadata = this.reflector.get<AuditMetadata | undefined>(AUDIT_KEY, context.getHandler());
    if (!metadata || context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const user = request.user;

    return next.handle().pipe(
      tap((result) => {
        const entityId =
          (result as { id?: string } | undefined)?.id ?? (request.params?.id as string | undefined);

        void this.auditService.record({
          companyId: user?.companyId ?? null,
          userId: user?.userId ?? null,
          action: metadata.action,
          entityType: metadata.entityType,
          entityId: entityId ?? null,
          after: this.sanitize(result),
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        });
      }),
    );
  }

  private sanitize(payload: unknown): Prisma.InputJsonValue | undefined {
    if (!payload || typeof payload !== 'object') {
      return undefined;
    }
    const clone = { ...(payload as Record<string, unknown>) };
    for (const sensitive of ['passwordHash', 'password', 'tokenHash', 'refreshToken']) {
      delete clone[sensitive];
    }
    return JSON.parse(JSON.stringify(clone)) as Prisma.InputJsonValue;
  }
}
