import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, InvoiceStatus } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { nextDocumentNumber } from '../../common/util/document-number';
import { computeDocumentTotals } from '../../common/util/line-totals';
import { CreatePurchaseInvoiceDto } from './dto/purchase-invoice.dto';

type PurchaseInvoiceEntity = Prisma.PurchaseInvoiceGetPayload<{
  include: { supplier: true; currency: true; lines: { include: { product: true; taxRate: true } } };
}>;

const PI_INCLUDE = {
  supplier: true,
  currency: true,
  lines: { include: { product: true, taxRate: true } },
} satisfies Prisma.PurchaseInvoiceInclude;

@Injectable()
export class PurchaseInvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveCurrencyId(
    companyId: string,
    supplierId: string,
    currencyId?: string,
  ): Promise<string> {
    if (currencyId) {
      return currencyId;
    }
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: supplierId, companyId },
      select: { currencyId: true },
    });
    if (supplier) {
      return supplier.currencyId;
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
    dto: CreatePurchaseInvoiceDto,
  ): Promise<PurchaseInvoiceEntity> {
    const supplier = await this.prisma.supplier.findFirst({ where: { id: dto.supplierId, companyId } });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
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

    const currencyId = await this.resolveCurrencyId(companyId, dto.supplierId, dto.currencyId);
    const invoiceNumber = await nextDocumentNumber(this.prisma.purchaseInvoice, companyId, 'AF');

    return this.prisma.purchaseInvoice.create({
      data: {
        companyId,
        supplierId: dto.supplierId,
        purchaseOrderId: dto.purchaseOrderId,
        invoiceNumber,
        supplierInvoiceNumber: dto.supplierInvoiceNumber,
        status: InvoiceStatus.DRAFT,
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
      include: PI_INCLUDE,
    });
  }

  async findAll(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<PurchaseInvoiceEntity>> {
    const where: Prisma.PurchaseInvoiceWhereInput = {
      companyId,
      ...(query.search ? { invoiceNumber: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.purchaseInvoice.findMany({
        where,
        include: PI_INCLUDE,
        orderBy: { issueDate: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.purchaseInvoice.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<PurchaseInvoiceEntity> {
    const invoice = await this.prisma.purchaseInvoice.findFirst({
      where: { id, companyId },
      include: PI_INCLUDE,
    });
    if (!invoice) {
      throw new NotFoundException('Purchase invoice not found');
    }
    return invoice;
  }

  async approve(companyId: string, id: string): Promise<PurchaseInvoiceEntity> {
    await this.findOne(companyId, id);
    await this.prisma.purchaseInvoice.update({
      where: { id },
      data: { status: InvoiceStatus.APPROVED },
    });
    return this.findOne(companyId, id);
  }
}
