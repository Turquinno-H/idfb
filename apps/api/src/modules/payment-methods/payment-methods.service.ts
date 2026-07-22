import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentMethodType, Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto/payment-methods.dto';

type Entity = Prisma.PaymentMethodGetPayload<Record<string, never>>;

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreatePaymentMethodDto): Promise<Entity> {
    return this.prisma.paymentMethod.create({
      data: {
        companyId,
        name: dto.name,
        type: dto.type ?? PaymentMethodType.CASH,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(companyId: string, query: PaginationQueryDto): Promise<PaginatedResult<Entity>> {
    const where: Prisma.PaymentMethodWhereInput = {
      companyId,
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.paymentMethod.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.paymentMethod.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<Entity> {
    const entity = await this.prisma.paymentMethod.findFirst({ where: { id, companyId } });
    if (!entity) {
      throw new NotFoundException('PaymentMethod not found');
    }
    return entity;
  }

  async update(companyId: string, id: string, dto: UpdatePaymentMethodDto): Promise<Entity> {
    await this.findOne(companyId, id);
    return this.prisma.paymentMethod.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string): Promise<Entity> {
    await this.findOne(companyId, id);
    return this.prisma.paymentMethod.delete({ where: { id } });
  }
}
