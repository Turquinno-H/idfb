import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { nextDocumentNumber } from '../../common/util/document-number';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

type SupplierEntity = Prisma.SupplierGetPayload<{ include: { currency: true } }>;

const SUPPLIER_INCLUDE = { currency: true } satisfies Prisma.SupplierInclude;

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveCurrencyId(companyId: string, currencyId?: string): Promise<string> {
    if (currencyId) {
      return currencyId;
    }
    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
      select: { baseCurrencyId: true },
    });
    return company.baseCurrencyId;
  }

  async create(companyId: string, dto: CreateSupplierDto): Promise<SupplierEntity> {
    const code = dto.code ?? (await nextDocumentNumber(this.prisma.supplier, companyId, 'TED'));
    const currencyId = await this.resolveCurrencyId(companyId, dto.currencyId);

    return this.prisma.supplier.create({
      data: {
        companyId,
        code,
        name: dto.name,
        type: dto.type,
        taxNumber: dto.taxNumber,
        taxOffice: dto.taxOffice,
        email: dto.email,
        phone: dto.phone,
        website: dto.website,
        currencyId,
        defaultWarehouseId: dto.defaultWarehouseId,
        paymentTermDays: dto.paymentTermDays ?? 0,
      },
      include: SUPPLIER_INCLUDE,
    });
  }

  async findAll(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<SupplierEntity>> {
    const where: Prisma.SupplierWhereInput = {
      companyId,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { code: { contains: query.search, mode: 'insensitive' } },
              { taxNumber: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.supplier.findMany({
        where,
        include: SUPPLIER_INCLUDE,
        orderBy: { name: 'asc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<SupplierEntity> {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, companyId },
      include: SUPPLIER_INCLUDE,
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    return supplier;
  }

  async getStatement(companyId: string, id: string): Promise<{
    supplierId: string;
    invoiceTotal: number;
    paidTotal: number;
    balance: number;
  }> {
    await this.findOne(companyId, id);

    const [invoiceAgg, paymentAgg] = await this.prisma.$transaction([
      this.prisma.purchaseInvoice.aggregate({
        where: { companyId, supplierId: id, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      this.prisma.payment.aggregate({
        where: { companyId, supplierId: id },
        _sum: { amount: true },
      }),
    ]);

    const invoiceTotal = Number(invoiceAgg._sum.total ?? 0);
    const paidTotal = Number(paymentAgg._sum.amount ?? 0);

    return { supplierId: id, invoiceTotal, paidTotal, balance: invoiceTotal - paidTotal };
  }

  async update(companyId: string, id: string, dto: UpdateSupplierDto): Promise<SupplierEntity> {
    await this.findOne(companyId, id);
    return this.prisma.supplier.update({
      where: { id },
      data: {
        code: dto.code,
        name: dto.name,
        type: dto.type,
        taxNumber: dto.taxNumber,
        taxOffice: dto.taxOffice,
        email: dto.email,
        phone: dto.phone,
        website: dto.website,
        currencyId: dto.currencyId,
        defaultWarehouseId: dto.defaultWarehouseId,
        paymentTermDays: dto.paymentTermDays,
      },
      include: SUPPLIER_INCLUDE,
    });
  }

  async remove(companyId: string, id: string): Promise<SupplierEntity> {
    await this.findOne(companyId, id);
    return this.prisma.supplier.delete({ where: { id }, include: SUPPLIER_INCLUDE });
  }
}
