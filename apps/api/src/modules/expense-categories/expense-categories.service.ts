import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { CreateExpenseCategoryDto, UpdateExpenseCategoryDto } from './dto/expense-categories.dto';

type Entity = Prisma.ExpenseCategoryGetPayload<Record<string, never>>;

@Injectable()
export class ExpenseCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateExpenseCategoryDto): Promise<Entity> {
    return this.prisma.expenseCategory.create({
      data: {
        companyId,
        name: dto.name,
        parentId: dto.parentId,
      },
    });
  }

  async findAll(companyId: string, query: PaginationQueryDto): Promise<PaginatedResult<Entity>> {
    const where: Prisma.ExpenseCategoryWhereInput = {
      companyId,
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.expenseCategory.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.expenseCategory.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<Entity> {
    const entity = await this.prisma.expenseCategory.findFirst({ where: { id, companyId } });
    if (!entity) {
      throw new NotFoundException('ExpenseCategory not found');
    }
    return entity;
  }

  async update(companyId: string, id: string, dto: UpdateExpenseCategoryDto): Promise<Entity> {
    await this.findOne(companyId, id);
    return this.prisma.expenseCategory.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string): Promise<Entity> {
    await this.findOne(companyId, id);
    return this.prisma.expenseCategory.delete({ where: { id } });
  }
}
