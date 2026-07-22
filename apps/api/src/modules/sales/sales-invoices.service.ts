import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, InvoiceStatus } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { nextDocumentNumber } from '../../common/util/document-number';
import { computeDocumentTotals } from '../../common/util/line-totals';
import { CreateSalesInvoiceDto } from './dto/sales.dto';

type SalesInvoiceEntity = Prisma.SalesInvoiceGetPayload<{
  include: { customer: true; currency: true; lines: { include: { product: true; taxRate: true } } };
}>;

const SI_INCLUDE = {
  customer: true,
  currency: true,
  lines: { include: { product: true, taxRate: true } },
} satisfies Prisma.SalesInvoiceInclude;

@Injectable()
export class SalesInvoicesService {
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

  async create(
    companyId: string,
    userId: string,
    dto: CreateSalesInvoiceDto,
  ): Promise<SalesInvoiceEntity> {
    const customer = await this.prisma.customer.findFirst({ where: { id: dto.customerId, companyId } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const taxRateIds = dto.lines.map((l) => l.taxRateId).filter((v): v is string => Boolean(v));
    const taxRates = await this.prisma.taxRate.findMany({
      where: { companyId, id: { in: taxRateIds } },
    });
    const taxRateMap = new Map(taxRates.map((t) => [t.id, Number(t.rate)]));

    const totals = computeDocumentTotals(
      dto.lines.map((line) => ({
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discountRate: line.discountRate,
        taxRate: line.taxRateId ? taxRateMap.get(line.taxRateId) : 0,
      })),
    );

    const currencyId = await this.resolveCurrencyId(companyId, dto.customerId, dto.currencyId);
    const invoiceNumber = await nextDocumentNumber(this.prisma.salesInvoice, companyId, 'SF');

    return this.prisma.salesInvoice.create({
      data: {
        companyId,
        customerId: dto.customerId,
        branchId: dto.branchId,
        salesOrderId: dto.salesOrderId,
        invoiceNumber,
        status: InvoiceStatus.DRAFT,
        invoiceType: dto.invoiceType,
        currencyId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        subtotal: totals.subtotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
        note: dto.note,
        createdByUserId: userId,
        lines: {
          create: dto.lines.map((line, index) => ({
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRateId: line.taxRateId,
            discountRate: line.discountRate ?? 0,
            lineTotal: totals.lines[index].grossLineTotal,
          })),
        },
      },
      include: SI_INCLUDE,
    });
  }

  async findAll(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<SalesInvoiceEntity>> {
    const where: Prisma.SalesInvoiceWhereInput = {
      companyId,
      ...(query.search ? { invoiceNumber: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.salesInvoice.findMany({
        where,
        include: SI_INCLUDE,
        orderBy: { issueDate: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.salesInvoice.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<SalesInvoiceEntity> {
    const invoice = await this.prisma.salesInvoice.findFirst({
      where: { id, companyId },
      include: SI_INCLUDE,
    });
    if (!invoice) {
      throw new NotFoundException('Sales invoice not found');
    }
    return invoice;
  }

  async approve(companyId: string, id: string): Promise<SalesInvoiceEntity> {
    const invoice = await this.findOne(companyId, id);
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be approved');
    }
    await this.prisma.salesInvoice.update({
      where: { id },
      data: { status: InvoiceStatus.APPROVED },
    });
    return this.findOne(companyId, id);
  }

  async cancel(companyId: string, id: string): Promise<SalesInvoiceEntity> {
    const invoice = await this.findOne(companyId, id);
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Paid invoices cannot be cancelled');
    }
    await this.prisma.salesInvoice.update({
      where: { id },
      data: { status: InvoiceStatus.CANCELLED },
    });
    return this.findOne(companyId, id);
  }
}
