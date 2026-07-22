import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, QuotationStatus } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { nextDocumentNumber } from '../../common/util/document-number';
import { CreateQuotationDto, UpdateQuotationDto } from './dto/sales.dto';

type QuotationEntity = Prisma.QuotationGetPayload<{
  include: { customer: true; currency: true; lines: { include: { product: true; taxRate: true } } };
}>;

const QUOTATION_INCLUDE = {
  customer: true,
  currency: true,
  lines: { include: { product: true, taxRate: true } },
} satisfies Prisma.QuotationInclude;

@Injectable()
export class QuotationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveCurrencyId(
    companyId: string,
    customerId: string,
    currencyId?: string,
  ): Promise<string> {
    if (currencyId) {
      return currencyId;
    }
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, companyId },
      select: { currencyId: true },
    });
    if (customer) {
      return customer.currencyId;
    }
    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
      select: { baseCurrencyId: true },
    });
    return company.baseCurrencyId;
  }

  async create(companyId: string, userId: string, dto: CreateQuotationDto): Promise<QuotationEntity> {
    const customer = await this.prisma.customer.findFirst({ where: { id: dto.customerId, companyId } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    const currencyId = await this.resolveCurrencyId(companyId, dto.customerId, dto.currencyId);
    const quotationNumber = await nextDocumentNumber(this.prisma.quotation, companyId, 'TEK');

    return this.prisma.quotation.create({
      data: {
        companyId,
        customerId: dto.customerId,
        branchId: dto.branchId,
        currencyId,
        quotationNumber,
        status: QuotationStatus.DRAFT,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        note: dto.note,
        createdByUserId: userId,
        lines: {
          create: dto.lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRateId: line.taxRateId,
            discountRate: line.discountRate ?? 0,
          })),
        },
      },
      include: QUOTATION_INCLUDE,
    });
  }

  async findAll(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<QuotationEntity>> {
    const where: Prisma.QuotationWhereInput = {
      companyId,
      ...(query.search ? { quotationNumber: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.quotation.findMany({
        where,
        include: QUOTATION_INCLUDE,
        orderBy: { issueDate: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.quotation.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<QuotationEntity> {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, companyId },
      include: QUOTATION_INCLUDE,
    });
    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }
    return quotation;
  }

  async update(companyId: string, id: string, dto: UpdateQuotationDto): Promise<QuotationEntity> {
    const quotation = await this.findOne(companyId, id);
    if (quotation.status !== QuotationStatus.DRAFT) {
      throw new BadRequestException('Only draft quotations can be edited');
    }
    return this.prisma.$transaction(async (tx) => {
      if (dto.lines) {
        await tx.quotationLine.deleteMany({ where: { quotationId: id } });
        await tx.quotationLine.createMany({
          data: dto.lines.map((line) => ({
            quotationId: id,
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRateId: line.taxRateId,
            discountRate: line.discountRate ?? 0,
          })),
        });
      }
      await tx.quotation.update({
        where: { id },
        data: {
          customerId: dto.customerId,
          branchId: dto.branchId,
          currencyId: dto.currencyId,
          validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
          note: dto.note,
        },
      });
      return tx.quotation.findFirstOrThrow({ where: { id }, include: QUOTATION_INCLUDE });
    });
  }

  async setStatus(
    companyId: string,
    id: string,
    status: QuotationStatus,
  ): Promise<QuotationEntity> {
    await this.findOne(companyId, id);
    await this.prisma.quotation.update({ where: { id }, data: { status } });
    return this.findOne(companyId, id);
  }

  async remove(companyId: string, id: string): Promise<QuotationEntity> {
    const quotation = await this.findOne(companyId, id);
    if (quotation.status === QuotationStatus.CONVERTED) {
      throw new BadRequestException('Converted quotations cannot be deleted');
    }
    return this.prisma.quotation.delete({ where: { id }, include: QUOTATION_INCLUDE });
  }
}
