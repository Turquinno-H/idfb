import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PaginationQueryDto,
  paginate,
  PaginatedResult,
} from '../../common/dto/pagination.dto';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/warehouse.dto';

type WarehouseEntity = Prisma.WarehouseGetPayload<{
  include: { branch: true };
}>;

const WAREHOUSE_INCLUDE = { branch: true } satisfies Prisma.WarehouseInclude;

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    companyId: string,
    dto: CreateWarehouseDto,
  ): Promise<WarehouseEntity> {
    return this.prisma.warehouse.create({
      data: {
        companyId,
        code: dto.code,
        name: dto.name,
        type: dto.type,
        branchId: dto.branchId,
        addressLine: dto.addressLine,
        isActive: dto.isActive ?? true,
      },
      include: WAREHOUSE_INCLUDE,
    });
  }

  async findAll(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<WarehouseEntity>> {
    const where: Prisma.WarehouseWhereInput = {
      companyId,
      ...(query.search
        ? { name: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.warehouse.findMany({
        where,
        include: WAREHOUSE_INCLUDE,
        orderBy: { code: 'asc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.warehouse.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<WarehouseEntity> {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id, companyId },
      include: WAREHOUSE_INCLUDE,
    });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }
    return warehouse;
  }

  async update(
    companyId: string,
    id: string,
    dto: UpdateWarehouseDto,
  ): Promise<WarehouseEntity> {
    await this.findOne(companyId, id);
    return this.prisma.warehouse.update({
      where: { id },
      data: dto,
      include: WAREHOUSE_INCLUDE,
    });
  }

  async remove(companyId: string, id: string): Promise<WarehouseEntity> {
    await this.findOne(companyId, id);
    return this.prisma.warehouse.delete({
      where: { id },
      include: WAREHOUSE_INCLUDE,
    });
  }
}
