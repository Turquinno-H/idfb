import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { CreateBankDto, UpdateBankDto } from './dto/banks.dto';

type Entity = Prisma.BankGetPayload<Record<string, never>>;

@Injectable()
export class BanksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateBankDto): Promise<Entity> {
    return this.prisma.bank.create({
      data: {
        companyId,
        name: dto.name,
        swiftCode: dto.swiftCode,
      },
    });
  }

  async findAll(companyId: string, query: PaginationQueryDto): Promise<PaginatedResult<Entity>> {
    const where: Prisma.BankWhereInput = {
      companyId,
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.bank.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.bank.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<Entity> {
    const entity = await this.prisma.bank.findFirst({ where: { id, companyId } });
    if (!entity) {
      throw new NotFoundException('Bank not found');
    }
    return entity;
  }

  async update(companyId: string, id: string, dto: UpdateBankDto): Promise<Entity> {
    await this.findOne(companyId, id);
    return this.prisma.bank.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string): Promise<Entity> {
    await this.findOne(companyId, id);
    return this.prisma.bank.delete({ where: { id } });
  }
}
