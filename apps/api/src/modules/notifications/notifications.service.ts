import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PaginationQueryDto,
  paginate,
  PaginatedResult,
} from '../../common/dto/pagination.dto';

type NotificationEntity = Prisma.NotificationGetPayload<Record<string, never>>;

export interface CreateNotificationInput {
  companyId?: string | null;
  userId: string;
  type: string;
  title: string;
  body?: string;
  data?: Prisma.InputJsonValue;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async push(input: CreateNotificationInput): Promise<NotificationEntity> {
    return this.prisma.notification.create({
      data: {
        companyId: input.companyId ?? undefined,
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data,
      },
    });
  }

  async listForUser(
    userId: string,
    query: PaginationQueryDto,
    onlyUnread = false,
  ): Promise<PaginatedResult<NotificationEntity>> {
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(onlyUnread ? { isRead: false } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.notification.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markRead(userId: string, id: string): Promise<NotificationEntity> {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead(userId: string): Promise<{ updated: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { updated: result.count };
  }
}
