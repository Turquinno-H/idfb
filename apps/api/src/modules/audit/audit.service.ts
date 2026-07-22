import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PaginationQueryDto,
  paginate,
  PaginatedResult,
} from '../../common/dto/pagination.dto';

export interface AuditRecord {
  companyId?: string | null;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(entry: AuditRecord): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          companyId: entry.companyId ?? undefined,
          userId: entry.userId ?? undefined,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId ?? undefined,
          before: entry.before,
          after: entry.after,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        },
      });
    } catch (error) {
      // Audit persistence must never break the main request flow.
      this.logger.error(
        `Failed to persist audit log: ${(error as Error).message}`,
      );
    }
  }

  async findAll(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<
    PaginatedResult<Prisma.AuditLogGetPayload<Record<string, never>>>
  > {
    const where: Prisma.AuditLogWhereInput = {
      companyId,
      ...(query.search
        ? {
            OR: [
              { action: { contains: query.search, mode: 'insensitive' } },
              { entityType: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return paginate(data, total, query.page, query.limit);
  }
}
