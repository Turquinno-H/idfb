import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PaginationQueryDto,
  paginate,
  PaginatedResult,
} from '../../common/dto/pagination.dto';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from './dto/departments.dto';

type Entity = Prisma.DepartmentGetPayload<Record<string, never>>;

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateDepartmentDto): Promise<Entity> {
    return this.prisma.department.create({
      data: {
        companyId,
        name: dto.name,
        parentId: dto.parentId,
      },
    });
  }

  async findAll(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Entity>> {
    const where: Prisma.DepartmentWhereInput = {
      companyId,
      ...(query.search
        ? { name: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.department.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.department.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<Entity> {
    const entity = await this.prisma.department.findFirst({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException('Department not found');
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    dto: UpdateDepartmentDto,
  ): Promise<Entity> {
    await this.findOne(companyId, id);
    return this.prisma.department.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string): Promise<Entity> {
    await this.findOne(companyId, id);
    return this.prisma.department.delete({ where: { id } });
  }
}
