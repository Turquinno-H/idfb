import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PaginationQueryDto,
  paginate,
  PaginatedResult,
} from '../../common/dto/pagination.dto';
import {
  CreateCostCenterDto,
  UpdateCostCenterDto,
} from './dto/cost-centers.dto';

type Entity = Prisma.CostCenterGetPayload<Record<string, never>>;

@Injectable()
export class CostCentersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateCostCenterDto): Promise<Entity> {
    return this.prisma.costCenter.create({
      data: {
        companyId,
        code: dto.code,
        name: dto.name,
        parentId: dto.parentId,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Entity>> {
    const where: Prisma.CostCenterWhereInput = {
      companyId,
      ...(query.search
        ? { name: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.costCenter.findMany({
        where,
        orderBy: { code: 'asc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.costCenter.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<Entity> {
    const entity = await this.prisma.costCenter.findFirst({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException('CostCenter not found');
    }
    return entity;
  }

  async update(
    companyId: string,
    id: string,
    dto: UpdateCostCenterDto,
  ): Promise<Entity> {
    await this.findOne(companyId, id);
    return this.prisma.costCenter.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string): Promise<Entity> {
    await this.findOne(companyId, id);
    return this.prisma.costCenter.delete({ where: { id } });
  }
}
