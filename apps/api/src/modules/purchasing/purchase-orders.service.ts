import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PurchaseOrderStatus, StockMovementType } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { nextDocumentNumber } from '../../common/util/document-number';
import { InventoryService } from '../inventory/inventory.service';
import {
  CreatePurchaseOrderDto,
  ReceivePurchaseOrderDto,
  UpdatePurchaseOrderDto,
} from './dto/purchase-order.dto';

type PurchaseOrderEntity = Prisma.PurchaseOrderGetPayload<{
  include: {
    supplier: true;
    warehouse: true;
    currency: true;
    lines: { include: { product: true; taxRate: true } };
  };
}>;

const PO_INCLUDE = {
  supplier: true,
  warehouse: true,
  currency: true,
  lines: { include: { product: true, taxRate: true } },
} satisfies Prisma.PurchaseOrderInclude;

@Injectable()
export class PurchaseOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
  ) {}

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

  async create(companyId: string, userId: string, dto: CreatePurchaseOrderDto): Promise<PurchaseOrderEntity> {
    const supplier = await this.prisma.supplier.findFirst({ where: { id: dto.supplierId, companyId } });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: dto.warehouseId, companyId },
    });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    const currencyId = await this.resolveCurrencyId(companyId, dto.supplierId, dto.currencyId);
    const orderNumber = await nextDocumentNumber(this.prisma.purchaseOrder, companyId, 'SAS');

    const created = await this.prisma.purchaseOrder.create({
      data: {
        companyId,
        supplierId: dto.supplierId,
        warehouseId: dto.warehouseId,
        branchId: dto.branchId,
        currencyId,
        orderNumber,
        status: PurchaseOrderStatus.DRAFT,
        expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
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
      include: PO_INCLUDE,
    });

    return created;
  }

  async findAll(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<PurchaseOrderEntity>> {
    const where: Prisma.PurchaseOrderWhereInput = {
      companyId,
      ...(query.search ? { orderNumber: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.purchaseOrder.findMany({
        where,
        include: PO_INCLUDE,
        orderBy: { orderDate: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<PurchaseOrderEntity> {
    const order = await this.prisma.purchaseOrder.findFirst({
      where: { id, companyId },
      include: PO_INCLUDE,
    });
    if (!order) {
      throw new NotFoundException('Purchase order not found');
    }
    return order;
  }

  async update(companyId: string, id: string, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrderEntity> {
    const order = await this.findOne(companyId, id);
    if (order.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException('Only draft purchase orders can be edited');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.lines) {
        await tx.purchaseOrderLine.deleteMany({ where: { purchaseOrderId: id } });
        await tx.purchaseOrderLine.createMany({
          data: dto.lines.map((line) => ({
            purchaseOrderId: id,
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRateId: line.taxRateId,
            discountRate: line.discountRate ?? 0,
          })),
        });
      }
      await tx.purchaseOrder.update({
        where: { id },
        data: {
          supplierId: dto.supplierId,
          warehouseId: dto.warehouseId,
          branchId: dto.branchId,
          currencyId: dto.currencyId,
          expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
          note: dto.note,
        },
      });
      return tx.purchaseOrder.findFirstOrThrow({ where: { id }, include: PO_INCLUDE });
    });
  }

  async confirm(companyId: string, id: string): Promise<PurchaseOrderEntity> {
    const order = await this.findOne(companyId, id);
    if (order.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException('Only draft purchase orders can be confirmed');
    }
    await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: PurchaseOrderStatus.CONFIRMED },
    });
    return this.findOne(companyId, id);
  }

  /**
   * Receives goods against a confirmed purchase order: creates a purchase
   * receipt, posts stock-IN movements (updating moving-average cost), bumps the
   * received quantities and recomputes the order status (partial vs complete).
   */
  async receive(
    companyId: string,
    userId: string,
    id: string,
    dto: ReceivePurchaseOrderDto,
  ): Promise<PurchaseOrderEntity> {
    const order = await this.findOne(companyId, id);
    const receivableStatuses: PurchaseOrderStatus[] = [
      PurchaseOrderStatus.CONFIRMED,
      PurchaseOrderStatus.PARTIALLY_RECEIVED,
    ];
    if (!receivableStatuses.includes(order.status)) {
      throw new BadRequestException('Purchase order must be confirmed before receiving');
    }

    const warehouseId = dto.warehouseId ?? order.warehouseId;
    const lineById = new Map(order.lines.map((line) => [line.id, line]));

    for (const receiveLine of dto.lines) {
      const orderLine = lineById.get(receiveLine.purchaseOrderLineId);
      if (!orderLine) {
        throw new BadRequestException(`Order line ${receiveLine.purchaseOrderLineId} not found on this order`);
      }
      const remaining = Number(orderLine.quantity) - Number(orderLine.receivedQuantity);
      if (receiveLine.quantity > remaining + 1e-6) {
        throw new BadRequestException(
          `Cannot receive ${receiveLine.quantity} of product; only ${remaining} remaining`,
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
      const receiptNumber = await nextDocumentNumber(tx.purchaseReceipt, companyId, 'MAL');
      const receipt = await tx.purchaseReceipt.create({
        data: {
          companyId,
          purchaseOrderId: id,
          supplierId: order.supplierId,
          warehouseId,
          receiptNumber,
          status: 'COMPLETED',
          createdByUserId: userId,
        },
      });

      for (const receiveLine of dto.lines) {
        const orderLine = lineById.get(receiveLine.purchaseOrderLineId)!;
        const unitCost = receiveLine.unitCost ?? Number(orderLine.unitPrice);

        await tx.purchaseReceiptLine.create({
          data: {
            purchaseReceiptId: receipt.id,
            purchaseOrderLineId: orderLine.id,
            productId: orderLine.productId,
            quantity: receiveLine.quantity,
            unitCost,
          },
        });

        await tx.purchaseOrderLine.update({
          where: { id: orderLine.id },
          data: { receivedQuantity: { increment: receiveLine.quantity } },
        });

        await this.inventoryService.applyMovement(
          {
            companyId,
            warehouseId,
            productId: orderLine.productId,
            type: StockMovementType.PURCHASE_IN,
            quantity: receiveLine.quantity,
            unitCost,
            referenceType: 'PURCHASE_RECEIPT',
            referenceId: receipt.id,
            userId,
          },
          tx,
        );
      }

      const refreshedLines = await tx.purchaseOrderLine.findMany({
        where: { purchaseOrderId: id },
      });
      const fullyReceived = refreshedLines.every(
        (line) => Number(line.receivedQuantity) >= Number(line.quantity) - 1e-6,
      );
      await tx.purchaseOrder.update({
        where: { id },
        data: {
          status: fullyReceived
            ? PurchaseOrderStatus.RECEIVED
            : PurchaseOrderStatus.PARTIALLY_RECEIVED,
        },
      });
    });

    return this.findOne(companyId, id);
  }

  async cancel(companyId: string, id: string): Promise<PurchaseOrderEntity> {
    const order = await this.findOne(companyId, id);
    if (order.status === PurchaseOrderStatus.RECEIVED) {
      throw new BadRequestException('Fully received purchase orders cannot be cancelled');
    }
    await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: PurchaseOrderStatus.CANCELLED },
    });
    return this.findOne(companyId, id);
  }
}
