import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { CreateIncomeCategoryDto, UpdateIncomeCategoryDto } from './dto/income-categories.dto';

type Entity = Prisma.IncomeCategoryGetPayload<Record<string, never>>;

@Injectable()
export class IncomeCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateIncomeCategoryDto): Promise<Entity> {
    return this.prisma.incomeCategory.create({
      data: {
        companyId,
        name: dto.name,
      },
    });
  }

  async findAll(companyId: string, query: PaginationQueryDto): Promise<PaginatedResult<Entity>> {
    const where: Prisma.IncomeCategoryWhereInput = {
      companyId,
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.incomeCategory.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.incomeCategory.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<Entity> {
    const entity = await this.prisma.incomeCategory.findFirst({ where: { id, companyId } });
    if (!entity) {
      throw new NotFoundException('IncomeCategory not found');
    }
    return entity;
  }

  async update(companyId: string, id: string, dto: UpdateIncomeCategoryDto): Promise<Entity> {
    await this.findOne(companyId, id);
    return this.prisma.incomeCategory.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string): Promise<Entity> {
    await this.findOne(companyId, id);
    return this.prisma.incomeCategory.delete({ where: { id } });
  }
}
