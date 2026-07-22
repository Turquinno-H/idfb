import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PaginationQueryDto,
  paginate,
  PaginatedResult,
} from '../../common/dto/pagination.dto';
import { nextDocumentNumber } from '../../common/util/document-number';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

type CustomerEntity = Prisma.CustomerGetPayload<{
  include: { currency: true; priceList: true };
}>;

const CUSTOMER_INCLUDE = {
  currency: true,
  priceList: true,
} satisfies Prisma.CustomerInclude;

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveCurrencyId(
    companyId: string,
    currencyId?: string,
  ): Promise<string> {
    if (currencyId) {
      return currencyId;
    }
    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
      select: { baseCurrencyId: true },
    });
    return company.baseCurrencyId;
  }

  async create(
    companyId: string,
    dto: CreateCustomerDto,
  ): Promise<CustomerEntity> {
    const code =
      dto.code ??
      (await nextDocumentNumber(this.prisma.customer, companyId, 'MUS'));
    const currencyId = await this.resolveCurrencyId(companyId, dto.currencyId);

    return this.prisma.customer.create({
      data: {
        companyId,
        code,
        name: dto.name,
        type: dto.type,
        taxNumber: dto.taxNumber,
        taxOffice: dto.taxOffice,
        nationalId: dto.nationalId,
        email: dto.email,
        phone: dto.phone,
        website: dto.website,
        currencyId,
        priceListId: dto.priceListId,
        defaultWarehouseId: dto.defaultWarehouseId,
        creditLimit: dto.creditLimit ?? 0,
        paymentTermDays: dto.paymentTermDays ?? 0,
      },
      include: CUSTOMER_INCLUDE,
    });
  }

  async findAll(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<CustomerEntity>> {
    const where: Prisma.CustomerWhereInput = {
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
      this.prisma.customer.findMany({
        where,
        include: CUSTOMER_INCLUDE,
        orderBy: { name: 'asc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<CustomerEntity> {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
      include: CUSTOMER_INCLUDE,
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async getStatement(
    companyId: string,
    id: string,
  ): Promise<{
    customerId: string;
    invoiceTotal: number;
    collectedTotal: number;
    balance: number;
  }> {
    await this.findOne(companyId, id);

    const [invoiceAgg, collectionAgg] = await this.prisma.$transaction([
      this.prisma.salesInvoice.aggregate({
        where: { companyId, customerId: id, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      this.prisma.collection.aggregate({
        where: { companyId, customerId: id },
        _sum: { amount: true },
      }),
    ]);

    const invoiceTotal = Number(invoiceAgg._sum.total ?? 0);
    const collectedTotal = Number(collectionAgg._sum.amount ?? 0);

    return {
      customerId: id,
      invoiceTotal,
      collectedTotal,
      balance: invoiceTotal - collectedTotal,
    };
  }

  async update(
    companyId: string,
    id: string,
    dto: UpdateCustomerDto,
  ): Promise<CustomerEntity> {
    await this.findOne(companyId, id);
    return this.prisma.customer.update({
      where: { id },
      data: {
        code: dto.code,
        name: dto.name,
        type: dto.type,
        taxNumber: dto.taxNumber,
        taxOffice: dto.taxOffice,
        nationalId: dto.nationalId,
        email: dto.email,
        phone: dto.phone,
        website: dto.website,
        currencyId: dto.currencyId,
        priceListId: dto.priceListId,
        defaultWarehouseId: dto.defaultWarehouseId,
        creditLimit: dto.creditLimit,
        paymentTermDays: dto.paymentTermDays,
      },
      include: CUSTOMER_INCLUDE,
    });
  }

  async remove(companyId: string, id: string): Promise<CustomerEntity> {
    await this.findOne(companyId, id);
    return this.prisma.customer.delete({
      where: { id },
      include: CUSTOMER_INCLUDE,
    });
  }
}
