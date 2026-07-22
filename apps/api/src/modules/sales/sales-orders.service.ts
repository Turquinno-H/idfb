import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SalesOrderStatus, StockMovementType } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { nextDocumentNumber } from '../../common/util/document-number';
import { InventoryService } from '../inventory/inventory.service';
import { CreateSalesOrderDto, UpdateSalesOrderDto } from './dto/sales.dto';

type SalesOrderEntity = Prisma.SalesOrderGetPayload<{
  include: {
    customer: true;
    warehouse: true;
    currency: true;
    lines: { include: { product: true; taxRate: true } };
  };
}>;

const SO_INCLUDE = {
  customer: true,
  warehouse: true,
  currency: true,
  lines: { include: { product: true, taxRate: true } },
} satisfies Prisma.SalesOrderInclude;

@Injectable()
export class SalesOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
  ) {}

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

  async create(companyId: string, userId: string, dto: CreateSalesOrderDto): Promise<SalesOrderEntity> {
    const customer = await this.prisma.customer.findFirst({ where: { id: dto.customerId, companyId } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: dto.warehouseId, companyId },
    });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }
    const currencyId = await this.resolveCurrencyId(companyId, dto.customerId, dto.currencyId);
    const orderNumber = await nextDocumentNumber(this.prisma.salesOrder, companyId, 'SIP');

    const created = await this.prisma.salesOrder.create({
      data: {
        companyId,
        customerId: dto.customerId,
        warehouseId: dto.warehouseId,
        branchId: dto.branchId,
        quotationId: dto.quotationId,
        currencyId,
        orderNumber,
        status: SalesOrderStatus.DRAFT,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
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
      include: SO_INCLUDE,
    });

    if (dto.quotationId) {
      await this.prisma.quotation.update({
        where: { id: dto.quotationId },
        data: { status: 'CONVERTED' },
      });
    }

    return created;
  }

  async findAll(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<SalesOrderEntity>> {
    const where: Prisma.SalesOrderWhereInput = {
      companyId,
      ...(query.search ? { orderNumber: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.salesOrder.findMany({
        where,
        include: SO_INCLUDE,
        orderBy: { orderDate: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.salesOrder.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<SalesOrderEntity> {
    const order = await this.prisma.salesOrder.findFirst({
      where: { id, companyId },
      include: SO_INCLUDE,
    });
    if (!order) {
      throw new NotFoundException('Sales order not found');
    }
    return order;
  }

  async update(companyId: string, id: string, dto: UpdateSalesOrderDto): Promise<SalesOrderEntity> {
    const order = await this.findOne(companyId, id);
    if (order.status !== SalesOrderStatus.DRAFT) {
      throw new BadRequestException('Only draft sales orders can be edited');
    }
    return this.prisma.$transaction(async (tx) => {
      if (dto.lines) {
        await tx.salesOrderLine.deleteMany({ where: { salesOrderId: id } });
        await tx.salesOrderLine.createMany({
          data: dto.lines.map((line) => ({
            salesOrderId: id,
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRateId: line.taxRateId,
            discountRate: line.discountRate ?? 0,
          })),
        });
      }
      await tx.salesOrder.update({
        where: { id },
        data: {
          customerId: dto.customerId,
          warehouseId: dto.warehouseId,
          branchId: dto.branchId,
          currencyId: dto.currencyId,
          deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
          note: dto.note,
        },
      });
      return tx.salesOrder.findFirstOrThrow({ where: { id }, include: SO_INCLUDE });
    });
  }

  async confirm(companyId: string, id: string): Promise<SalesOrderEntity> {
    const order = await this.findOne(companyId, id);
    if (order.status !== SalesOrderStatus.DRAFT) {
      throw new BadRequestException('Only draft sales orders can be confirmed');
    }
    await this.prisma.salesOrder.update({
      where: { id },
      data: { status: SalesOrderStatus.CONFIRMED },
    });
    return this.findOne(companyId, id);
  }

  /**
   * Delivers the full outstanding quantity of a confirmed sales order, posting
   * stock-OUT movements at moving-average cost and marking the order delivered.
   */
  async deliver(companyId: string, userId: string, id: string): Promise<SalesOrderEntity> {
    const order = await this.findOne(companyId, id);
    const deliverableStatuses: SalesOrderStatus[] = [
      SalesOrderStatus.CONFIRMED,
      SalesOrderStatus.PARTIALLY_DELIVERED,
    ];
    if (!deliverableStatuses.includes(order.status)) {
      throw new BadRequestException('Sales order must be confirmed before delivery');
    }

    await this.prisma.$transaction(async (tx) => {
      for (const line of order.lines) {
        const remaining = Number(line.quantity) - Number(line.deliveredQuantity);
        if (remaining <= 0) {
          continue;
        }
        await this.inventoryService.applyMovement(
          {
            companyId,
            warehouseId: order.warehouseId,
            productId: line.productId,
            type: StockMovementType.SALE_OUT,
            quantity: remaining,
            referenceType: 'SALES_ORDER',
            referenceId: order.id,
            userId,
          },
          tx,
        );
        await tx.salesOrderLine.update({
          where: { id: line.id },
          data: { deliveredQuantity: line.quantity },
        });
      }
      await tx.salesOrder.update({
        where: { id },
        data: { status: SalesOrderStatus.DELIVERED },
      });
    });

    return this.findOne(companyId, id);
  }

  async cancel(companyId: string, id: string): Promise<SalesOrderEntity> {
    const order = await this.findOne(companyId, id);
    if (order.status === SalesOrderStatus.DELIVERED) {
      throw new BadRequestException('Delivered sales orders cannot be cancelled');
    }
    await this.prisma.salesOrder.update({
      where: { id },
      data: { status: SalesOrderStatus.CANCELLED },
    });
    return this.findOne(companyId, id);
  }
}
