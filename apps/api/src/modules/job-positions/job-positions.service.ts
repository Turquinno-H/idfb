import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { CreateJobPositionDto, UpdateJobPositionDto } from './dto/job-positions.dto';

type Entity = Prisma.JobPositionGetPayload<Record<string, never>>;

@Injectable()
export class JobPositionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateJobPositionDto): Promise<Entity> {
    return this.prisma.jobPosition.create({
      data: {
        companyId,
        title: dto.title,
        departmentId: dto.departmentId,
      },
    });
  }

  async findAll(companyId: string, query: PaginationQueryDto): Promise<PaginatedResult<Entity>> {
    const where: Prisma.JobPositionWhereInput = {
      companyId,
      ...(query.search ? { title: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.jobPosition.findMany({
        where,
        orderBy: { title: 'asc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.jobPosition.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<Entity> {
    const entity = await this.prisma.jobPosition.findFirst({ where: { id, companyId } });
    if (!entity) {
      throw new NotFoundException('JobPosition not found');
    }
    return entity;
  }

  async update(companyId: string, id: string, dto: UpdateJobPositionDto): Promise<Entity> {
    await this.findOne(companyId, id);
    return this.prisma.jobPosition.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string): Promise<Entity> {
    await this.findOne(companyId, id);
    return this.prisma.jobPosition.delete({ where: { id } });
  }
}
