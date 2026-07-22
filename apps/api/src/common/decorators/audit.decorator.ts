import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';

export interface AuditMetadata {
  action: string;
  entityType: string;
}

/** Flags a mutating route for audit logging with the given action and entity type. */
export const Audit = (action: string, entityType: string): MethodDecorator =>
  SetMetadata(AUDIT_KEY, { action, entityType });
