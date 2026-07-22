import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';

type BranchEntity = Prisma.BranchGetPayload<Record<string, never>>;

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateBranchDto): Promise<BranchEntity> {
    return this.prisma.$transaction(async (tx) => {
      if (dto.isMain) {
        await tx.branch.updateMany({ where: { companyId, isMain: true }, data: { isMain: false } });
      }
      return tx.branch.create({
        data: {
          companyId,
          code: dto.code,
          name: dto.name,
          addressLine: dto.addressLine,
          city: dto.city,
          district: dto.district,
          phone: dto.phone,
          email: dto.email,
          isMain: dto.isMain ?? false,
          isActive: dto.isActive ?? true,
        },
      });
    });
  }

  async findAll(companyId: string, query: PaginationQueryDto): Promise<PaginatedResult<BranchEntity>> {
    const where: Prisma.BranchWhereInput = {
      companyId,
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.branch.findMany({ where, orderBy: { code: 'asc' }, skip: query.skip, take: query.limit }),
      this.prisma.branch.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<BranchEntity> {
    const branch = await this.prisma.branch.findFirst({ where: { id, companyId } });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }
    return branch;
  }

  async update(companyId: string, id: string, dto: UpdateBranchDto): Promise<BranchEntity> {
    await this.findOne(companyId, id);
    return this.prisma.$transaction(async (tx) => {
      if (dto.isMain) {
        await tx.branch.updateMany({
          where: { companyId, isMain: true, NOT: { id } },
          data: { isMain: false },
        });
      }
      return tx.branch.update({ where: { id }, data: dto });
    });
  }

  async remove(companyId: string, id: string): Promise<BranchEntity> {
    await this.findOne(companyId, id);
    return this.prisma.branch.delete({ where: { id } });
  }
}
