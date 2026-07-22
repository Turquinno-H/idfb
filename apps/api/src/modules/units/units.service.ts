import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { CreateUnitDto, UpdateUnitDto } from './dto/units.dto';

type Entity = Prisma.UnitGetPayload<Record<string, never>>;

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateUnitDto): Promise<Entity> {
    return this.prisma.unit.create({
      data: {
        companyId,
        name: dto.name,
        code: dto.code,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(companyId: string, query: PaginationQueryDto): Promise<PaginatedResult<Entity>> {
    const where: Prisma.UnitWhereInput = {
      companyId,
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.unit.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.unit.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<Entity> {
    const entity = await this.prisma.unit.findFirst({ where: { id, companyId } });
    if (!entity) {
      throw new NotFoundException('Unit not found');
    }
    return entity;
  }

  async update(companyId: string, id: string, dto: UpdateUnitDto): Promise<Entity> {
    await this.findOne(companyId, id);
    return this.prisma.unit.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string): Promise<Entity> {
    await this.findOne(companyId, id);
    return this.prisma.unit.delete({ where: { id } });
  }
}
