import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { CreateTaxRateDto, UpdateTaxRateDto } from './dto/tax-rates.dto';

type Entity = Prisma.TaxRateGetPayload<Record<string, never>>;

@Injectable()
export class TaxRatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateTaxRateDto): Promise<Entity> {
    return this.prisma.taxRate.create({
      data: {
        companyId,
        name: dto.name,
        rate: dto.rate,
        isDefault: dto.isDefault ?? false,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(companyId: string, query: PaginationQueryDto): Promise<PaginatedResult<Entity>> {
    const where: Prisma.TaxRateWhereInput = {
      companyId,
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.taxRate.findMany({
        where,
        orderBy: { rate: 'asc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.taxRate.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<Entity> {
    const entity = await this.prisma.taxRate.findFirst({ where: { id, companyId } });
    if (!entity) {
      throw new NotFoundException('TaxRate not found');
    }
    return entity;
  }

  async update(companyId: string, id: string, dto: UpdateTaxRateDto): Promise<Entity> {
    await this.findOne(companyId, id);
    return this.prisma.taxRate.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string): Promise<Entity> {
    await this.findOne(companyId, id);
    return this.prisma.taxRate.delete({ where: { id } });
  }
}
