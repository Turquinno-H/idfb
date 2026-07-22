import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

type CategoryEntity = Prisma.CategoryGetPayload<Record<string, never>>;

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateCategoryDto): Promise<CategoryEntity> {
    return this.prisma.category.create({
      data: {
        companyId,
        name: dto.name,
        code: dto.code,
        parentId: dto.parentId,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<CategoryEntity>> {
    const where: Prisma.CategoryWhereInput = {
      companyId,
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.category.count({ where }),
    ]);

    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<CategoryEntity> {
    const category = await this.prisma.category.findFirst({ where: { id, companyId } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(companyId: string, id: string, dto: UpdateCategoryDto): Promise<CategoryEntity> {
    await this.findOne(companyId, id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string): Promise<CategoryEntity> {
    await this.findOne(companyId, id);
    return this.prisma.category.delete({ where: { id } });
  }
}
