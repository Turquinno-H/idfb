import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StockMovementType } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';

type StockItemEntity = Prisma.StockItemGetPayload<{
  include: { product: { include: { unit: true } }; warehouse: true };
}>;

type StockMovementEntity = Prisma.StockMovementGetPayload<{
  include: { product: true; warehouse: true };
}>;

export interface ApplyMovementInput {
  companyId: string;
  warehouseId: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  unitCost?: number;
  batchNumber?: string;
  serialNumber?: string;
  referenceType?: string;
  referenceId?: string;
  note?: string;
  userId?: string;
}

const INCOMING_TYPES: ReadonlySet<StockMovementType> = new Set([
  StockMovementType.PURCHASE_IN,
  StockMovementType.ADJUSTMENT_IN,
  StockMovementType.TRANSFER_IN,
  StockMovementType.PRODUCTION_IN,
  StockMovementType.RETURN_IN,
]);

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  isIncoming(type: StockMovementType): boolean {
    return INCOMING_TYPES.has(type);
  }

  /**
   * Applies a stock movement and updates the on-hand quantity plus the moving
   * average cost for incoming movements. Must be called inside a transaction
   * when part of a larger document workflow; accepts an optional tx client.
   */
  async applyMovement(
    input: ApplyMovementInput,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    if (input.quantity <= 0) {
      throw new BadRequestException('Movement quantity must be positive');
    }

    const incoming = this.isIncoming(input.type);
    const signedQuantity = incoming ? input.quantity : -input.quantity;

    const stockItem = await client.stockItem.findUnique({
      where: { warehouseId_productId: { warehouseId: input.warehouseId, productId: input.productId } },
    });

    const currentQty = stockItem ? Number(stockItem.quantityOnHand) : 0;
    const currentAvgCost = stockItem ? Number(stockItem.averageCost) : 0;

    if (!incoming && currentQty < input.quantity) {
      throw new BadRequestException(
        `Insufficient stock: on-hand ${currentQty}, requested ${input.quantity}`,
      );
    }

    let newAvgCost = currentAvgCost;
    if (incoming && input.unitCost !== undefined && input.unitCost >= 0) {
      const newQty = currentQty + input.quantity;
      newAvgCost =
        newQty > 0
          ? (currentQty * currentAvgCost + input.quantity * input.unitCost) / newQty
          : input.unitCost;
    }

    await client.stockItem.upsert({
      where: { warehouseId_productId: { warehouseId: input.warehouseId, productId: input.productId } },
      create: {
        companyId: input.companyId,
        warehouseId: input.warehouseId,
        productId: input.productId,
        quantityOnHand: signedQuantity,
        averageCost: incoming ? newAvgCost : currentAvgCost,
      },
      update: {
        quantityOnHand: { increment: signedQuantity },
        ...(incoming && input.unitCost !== undefined ? { averageCost: newAvgCost } : {}),
      },
    });

    await client.stockMovement.create({
      data: {
        companyId: input.companyId,
        warehouseId: input.warehouseId,
        productId: input.productId,
        type: input.type,
        quantity: input.quantity,
        unitCost: input.unitCost ?? (incoming ? 0 : currentAvgCost),
        batchNumber: input.batchNumber,
        serialNumber: input.serialNumber,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        note: input.note,
        createdByUserId: input.userId,
      },
    });
  }

  async listStock(
    companyId: string,
    query: PaginationQueryDto,
    warehouseId?: string,
  ): Promise<PaginatedResult<StockItemEntity>> {
    const where: Prisma.StockItemWhereInput = {
      companyId,
      ...(warehouseId ? { warehouseId } : {}),
      ...(query.search
        ? { product: { name: { contains: query.search, mode: 'insensitive' } } }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.stockItem.findMany({
        where,
        include: { product: { include: { unit: true } }, warehouse: true },
        orderBy: { product: { name: 'asc' } },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.stockItem.count({ where }),
    ]);

    return paginate(data, total, query.page, query.limit);
  }

  async listMovements(
    companyId: string,
    query: PaginationQueryDto,
    productId?: string,
    warehouseId?: string,
  ): Promise<PaginatedResult<StockMovementEntity>> {
    const where: Prisma.StockMovementWhereInput = {
      companyId,
      ...(productId ? { productId } : {}),
      ...(warehouseId ? { warehouseId } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.stockMovement.findMany({
        where,
        include: { product: true, warehouse: true },
        orderBy: { movementDate: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return paginate(data, total, query.page, query.limit);
  }

  async adjust(
    companyId: string,
    input: {
      warehouseId: string;
      productId: string;
      quantity: number;
      direction: 'IN' | 'OUT';
      unitCost?: number;
      note?: string;
      userId?: string;
    },
  ): Promise<{ success: true }> {
    await this.assertProductAndWarehouse(companyId, input.productId, input.warehouseId);
    await this.applyMovement({
      companyId,
      warehouseId: input.warehouseId,
      productId: input.productId,
      type: input.direction === 'IN' ? StockMovementType.ADJUSTMENT_IN : StockMovementType.ADJUSTMENT_OUT,
      quantity: input.quantity,
      unitCost: input.unitCost,
      referenceType: 'MANUAL_ADJUSTMENT',
      note: input.note,
      userId: input.userId,
    });
    return { success: true };
  }

  async transfer(
    companyId: string,
    input: {
      fromWarehouseId: string;
      toWarehouseId: string;
      productId: string;
      quantity: number;
      note?: string;
      userId?: string;
    },
  ): Promise<{ success: true; stockTransferId: string }> {
    if (input.fromWarehouseId === input.toWarehouseId) {
      throw new BadRequestException('Source and destination warehouses must differ');
    }
    await this.assertProductAndWarehouse(companyId, input.productId, input.fromWarehouseId);
    await this.assertProductAndWarehouse(companyId, input.productId, input.toWarehouseId);

    return this.prisma.$transaction(async (tx) => {
      const sourceStock = await tx.stockItem.findUnique({
        where: {
          warehouseId_productId: { warehouseId: input.fromWarehouseId, productId: input.productId },
        },
      });
      const unitCost = sourceStock ? Number(sourceStock.averageCost) : 0;

      const transfer = await tx.stockTransfer.create({
        data: {
          companyId,
          fromWarehouseId: input.fromWarehouseId,
          toWarehouseId: input.toWarehouseId,
          status: 'COMPLETED',
          note: input.note,
          createdByUserId: input.userId,
          lines: { create: [{ productId: input.productId, quantity: input.quantity }] },
        },
      });

      await this.applyMovement(
        {
          companyId,
          warehouseId: input.fromWarehouseId,
          productId: input.productId,
          type: StockMovementType.TRANSFER_OUT,
          quantity: input.quantity,
          unitCost,
          referenceType: 'STOCK_TRANSFER',
          referenceId: transfer.id,
          userId: input.userId,
        },
        tx,
      );

      await this.applyMovement(
        {
          companyId,
          warehouseId: input.toWarehouseId,
          productId: input.productId,
          type: StockMovementType.TRANSFER_IN,
          quantity: input.quantity,
          unitCost,
          referenceType: 'STOCK_TRANSFER',
          referenceId: transfer.id,
          userId: input.userId,
        },
        tx,
      );

      return { success: true as const, stockTransferId: transfer.id };
    });
  }

  private async assertProductAndWarehouse(
    companyId: string,
    productId: string,
    warehouseId: string,
  ): Promise<void> {
    const [product, warehouse] = await this.prisma.$transaction([
      this.prisma.product.findFirst({ where: { id: productId, companyId } }),
      this.prisma.warehouse.findFirst({ where: { id: warehouseId, companyId } }),
    ]);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }
  }
}
