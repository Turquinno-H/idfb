import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';

type AttachmentEntity = Prisma.AttachmentGetPayload<Record<string, never>>;

export interface UploadFileInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  entityType?: string;
  entityId?: string;
  productId?: string;
  userId?: string;
}

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async upload(companyId: string, input: UploadFileInput): Promise<AttachmentEntity> {
    const result = await this.storage.upload(
      input.buffer,
      input.originalName,
      input.mimeType,
      companyId,
    );
    const checksum = createHash('sha256').update(input.buffer).digest('hex');

    return this.prisma.attachment.create({
      data: {
        companyId,
        fileName: result.storageKey.split('/').pop() ?? input.originalName,
        originalName: input.originalName,
        mimeType: input.mimeType,
        size: result.size,
        storageKey: result.storageKey,
        storageBucket: result.storageBucket,
        checksum,
        entityType: input.entityType,
        entityId: input.entityId,
        productId: input.productId,
        uploadedByUserId: input.userId,
      },
    });
  }

  async findAll(
    companyId: string,
    query: PaginationQueryDto,
    entityType?: string,
    entityId?: string,
  ): Promise<PaginatedResult<AttachmentEntity>> {
    const where: Prisma.AttachmentWhereInput = {
      companyId,
      ...(entityType ? { entityType } : {}),
      ...(entityId ? { entityId } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.attachment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.attachment.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async getDownloadUrl(companyId: string, id: string): Promise<{ url: string; originalName: string }> {
    const attachment = await this.prisma.attachment.findFirst({ where: { id, companyId } });
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }
    const url = await this.storage.getPresignedDownloadUrl(attachment.storageKey);
    return { url, originalName: attachment.originalName };
  }

  async remove(companyId: string, id: string): Promise<{ success: true }> {
    const attachment = await this.prisma.attachment.findFirst({ where: { id, companyId } });
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }
    await this.storage.remove(attachment.storageKey).catch(() => undefined);
    await this.prisma.attachment.delete({ where: { id } });
    return { success: true };
  }
}
