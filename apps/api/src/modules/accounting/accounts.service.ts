import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { CreateAccountDto, UpdateAccountDto } from './dto/accounting.dto';

type AccountEntity = Prisma.AccountGetPayload<Record<string, never>>;

@Injectable()
export class ChartOfAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateAccountDto): Promise<AccountEntity> {
    return this.prisma.account.create({
      data: {
        companyId,
        code: dto.code,
        name: dto.name,
        type: dto.type,
        parentId: dto.parentId,
      },
    });
  }

  async findAll(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<AccountEntity>> {
    const where: Prisma.AccountWhereInput = {
      companyId,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { code: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.account.findMany({
        where,
        orderBy: { code: 'asc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.account.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<AccountEntity> {
    const account = await this.prisma.account.findFirst({ where: { id, companyId } });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async update(companyId: string, id: string, dto: UpdateAccountDto): Promise<AccountEntity> {
    await this.findOne(companyId, id);
    return this.prisma.account.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string): Promise<AccountEntity> {
    await this.findOne(companyId, id);
    return this.prisma.account.delete({ where: { id } });
  }
}
