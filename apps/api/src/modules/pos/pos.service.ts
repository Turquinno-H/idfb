import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  POSTransactionStatus,
  Prisma,
  StockMovementType,
} from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PaginationQueryDto,
  paginate,
  PaginatedResult,
} from '../../common/dto/pagination.dto';
import { nextDocumentNumber } from '../../common/util/document-number';
import { computeDocumentTotals } from '../../common/util/line-totals';
import { InventoryService } from '../inventory/inventory.service';
import {
  CreatePosSaleDto,
  CreatePosTerminalDto,
  UpdatePosTerminalDto,
} from './dto/pos.dto';

type PosTerminalEntity = Prisma.POSTerminalGetPayload<{
  include: { warehouse: true };
}>;
type PosTransactionEntity = Prisma.POSTransactionGetPayload<{
  include: {
    lines: { include: { product: true } };
    payments: true;
    customer: true;
  };
}>;

const POS_TX_INCLUDE = {
  lines: { include: { product: true } },
  payments: true,
  customer: true,
} satisfies Prisma.POSTransactionInclude;

@Injectable()
export class PosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
  ) {}

  // ---- Terminals ----

  async createTerminal(
    companyId: string,
    dto: CreatePosTerminalDto,
  ): Promise<PosTerminalEntity> {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: dto.warehouseId, companyId },
    });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }
    return this.prisma.pOSTerminal.create({
      data: {
        companyId,
        code: dto.code,
        name: dto.name,
        warehouseId: dto.warehouseId,
        branchId: dto.branchId,
        isActive: dto.isActive ?? true,
      },
      include: { warehouse: true },
    });
  }

  async listTerminals(companyId: string): Promise<PosTerminalEntity[]> {
    return this.prisma.pOSTerminal.findMany({
      where: { companyId },
      include: { warehouse: true },
      orderBy: { name: 'asc' },
    });
  }

  async updateTerminal(
    companyId: string,
    id: string,
    dto: UpdatePosTerminalDto,
  ): Promise<PosTerminalEntity> {
    const terminal = await this.prisma.pOSTerminal.findFirst({
      where: { id, companyId },
    });
    if (!terminal) {
      throw new NotFoundException('POS terminal not found');
    }
    return this.prisma.pOSTerminal.update({
      where: { id },
      data: dto,
      include: { warehouse: true },
    });
  }

  // ---- Sales ----

  /**
   * Processes a complete POS sale in one transaction: validates the terminal,
   * resolves product prices, computes tax-inclusive totals, verifies the tendered
   * amount covers the total, posts stock-out movements and persists the receipt.
   */
  async createSale(
    companyId: string,
    userId: string,
    dto: CreatePosSaleDto,
  ): Promise<PosTransactionEntity> {
    const terminal = await this.prisma.pOSTerminal.findFirst({
      where: { id: dto.posTerminalId, companyId },
    });
    if (!terminal) {
      throw new NotFoundException('POS terminal not found');
    }

    const productIds = [...new Set(dto.lines.map((l) => l.productId))];
    const products = await this.prisma.product.findMany({
      where: { companyId, id: { in: productIds } },
      select: { id: true, salesPrice: true, taxRateId: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));
    if (productMap.size !== productIds.length) {
      throw new BadRequestException('One or more products are invalid');
    }

    const taxRateIds = [
      ...new Set(
        dto.lines
          .map(
            (l) =>
              l.taxRateId ??
              productMap.get(l.productId)?.taxRateId ??
              undefined,
          )
          .filter((v): v is string => Boolean(v)),
      ),
    ];
    const taxRates = await this.prisma.taxRate.findMany({
      where: { companyId, id: { in: taxRateIds } },
    });
    const taxRateMap = new Map(taxRates.map((t) => [t.id, Number(t.rate)]));

    const resolvedLines = dto.lines.map((line) => {
      const product = productMap.get(line.productId)!;
      const unitPrice = line.unitPrice ?? Number(product.salesPrice);
      const taxRateId = line.taxRateId ?? product.taxRateId ?? undefined;
      return {
        productId: line.productId,
        quantity: line.quantity,
        unitPrice,
        discountRate: line.discountRate ?? 0,
        taxRateId,
        taxRate: taxRateId ? (taxRateMap.get(taxRateId) ?? 0) : 0,
      };
    });

    const totals = computeDocumentTotals(resolvedLines);
    const tendered = dto.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    if (tendered + 1e-6 < totals.total) {
      throw new BadRequestException(
        `Tendered amount ${tendered} is less than the total ${totals.total}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const transactionNumber = await nextDocumentNumber(
        tx.pOSTransaction,
        companyId,
        'POS',
      );

      const transaction = await tx.pOSTransaction.create({
        data: {
          companyId,
          posTerminalId: dto.posTerminalId,
          cashierUserId: userId,
          customerId: dto.customerId,
          transactionNumber,
          status: POSTransactionStatus.COMPLETED,
          subtotal: totals.subtotal,
          taxTotal: totals.taxTotal,
          total: totals.total,
          lines: {
            create: resolvedLines.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              taxRateId: line.taxRateId,
              discountRate: line.discountRate,
            })),
          },
          payments: {
            create: dto.payments.map((payment) => ({
              paymentMethodId: payment.paymentMethodId,
              amount: payment.amount,
            })),
          },
        },
        include: POS_TX_INCLUDE,
      });

      for (const line of resolvedLines) {
        await this.inventoryService.applyMovement(
          {
            companyId,
            warehouseId: terminal.warehouseId,
            productId: line.productId,
            type: StockMovementType.SALE_OUT,
            quantity: line.quantity,
            referenceType: 'POS_TRANSACTION',
            referenceId: transaction.id,
            userId,
          },
          tx,
        );
      }

      return transaction;
    });
  }

  async listTransactions(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<PosTransactionEntity>> {
    const where: Prisma.POSTransactionWhereInput = {
      companyId,
      ...(query.search
        ? { transactionNumber: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.pOSTransaction.findMany({
        where,
        include: POS_TX_INCLUDE,
        orderBy: { transactionDate: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.pOSTransaction.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async getTransaction(
    companyId: string,
    id: string,
  ): Promise<PosTransactionEntity> {
    const transaction = await this.prisma.pOSTransaction.findFirst({
      where: { id, companyId },
      include: POS_TX_INCLUDE,
    });
    if (!transaction) {
      throw new NotFoundException('POS transaction not found');
    }
    return transaction;
  }
}
