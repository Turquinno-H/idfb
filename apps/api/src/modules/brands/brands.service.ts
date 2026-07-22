import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

type BrandEntity = Prisma.BrandGetPayload<Record<string, never>>;

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateBrandDto): Promise<BrandEntity> {
    return this.prisma.brand.create({
      data: { companyId, name: dto.name, code: dto.code, isActive: dto.isActive ?? true },
    });
  }

  async findAll(companyId: string, query: PaginationQueryDto): Promise<PaginatedResult<BrandEntity>> {
    const where: Prisma.BrandWhereInput = {
      companyId,
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.brand.findMany({ where, orderBy: { name: 'asc' }, skip: query.skip, take: query.limit }),
      this.prisma.brand.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<BrandEntity> {
    const brand = await this.prisma.brand.findFirst({ where: { id, companyId } });
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return brand;
  }

  async update(companyId: string, id: string, dto: UpdateBrandDto): Promise<BrandEntity> {
    await this.findOne(companyId, id);
    return this.prisma.brand.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string): Promise<BrandEntity> {
    await this.findOne(companyId, id);
    return this.prisma.brand.delete({ where: { id } });
  }
}
