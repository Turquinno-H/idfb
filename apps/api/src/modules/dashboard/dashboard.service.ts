import { Injectable } from '@nestjs/common';
import { InvoiceStatus } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';

export interface DashboardSummary {
  counts: {
    customers: number;
    suppliers: number;
    products: number;
    openSalesOrders: number;
    openPurchaseOrders: number;
  };
  sales: {
    invoiceTotal: number;
    collectedTotal: number;
    receivable: number;
  };
  purchasing: {
    invoiceTotal: number;
    paidTotal: number;
    payable: number;
  };
  lowStock: { productId: string; name: string; onHand: number; minStockLevel: number }[];
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(companyId: string): Promise<DashboardSummary> {
    const [
      customers,
      suppliers,
      products,
      openSalesOrders,
      openPurchaseOrders,
      salesInvoiceAgg,
      collectionAgg,
      purchaseInvoiceAgg,
      paymentAgg,
    ] = await this.prisma.$transaction([
      this.prisma.customer.count({ where: { companyId } }),
      this.prisma.supplier.count({ where: { companyId } }),
      this.prisma.product.count({ where: { companyId } }),
      this.prisma.salesOrder.count({
        where: { companyId, status: { in: ['DRAFT', 'CONFIRMED', 'PARTIALLY_DELIVERED'] } },
      }),
      this.prisma.purchaseOrder.count({
        where: { companyId, status: { in: ['DRAFT', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'SENT'] } },
      }),
      this.prisma.salesInvoice.aggregate({
        where: { companyId, status: { not: InvoiceStatus.CANCELLED } },
        _sum: { total: true, paidAmount: true },
      }),
      this.prisma.collection.aggregate({ where: { companyId }, _sum: { amount: true } }),
      this.prisma.purchaseInvoice.aggregate({
        where: { companyId, status: { not: InvoiceStatus.CANCELLED } },
        _sum: { total: true, paidAmount: true },
      }),
      this.prisma.payment.aggregate({ where: { companyId }, _sum: { amount: true } }),
    ]);

    const salesInvoiceTotal = Number(salesInvoiceAgg._sum.total ?? 0);
    const salesPaid = Number(salesInvoiceAgg._sum.paidAmount ?? 0);
    const purchaseInvoiceTotal = Number(purchaseInvoiceAgg._sum.total ?? 0);
    const purchasePaid = Number(purchaseInvoiceAgg._sum.paidAmount ?? 0);

    const lowStock = await this.getLowStock(companyId);

    return {
      counts: {
        customers,
        suppliers,
        products,
        openSalesOrders,
        openPurchaseOrders,
      },
      sales: {
        invoiceTotal: salesInvoiceTotal,
        collectedTotal: Number(collectionAgg._sum.amount ?? 0),
        receivable: salesInvoiceTotal - salesPaid,
      },
      purchasing: {
        invoiceTotal: purchaseInvoiceTotal,
        paidTotal: Number(paymentAgg._sum.amount ?? 0),
        payable: purchaseInvoiceTotal - purchasePaid,
      },
      lowStock,
    };
  }

  private async getLowStock(
    companyId: string,
  ): Promise<{ productId: string; name: string; onHand: number; minStockLevel: number }[]> {
    const products = await this.prisma.product.findMany({
      where: { companyId, minStockLevel: { not: null }, isActive: true },
      select: { id: true, name: true, minStockLevel: true, stockItems: { select: { quantityOnHand: true } } },
    });

    const rows: { productId: string; name: string; onHand: number; minStockLevel: number }[] = [];
    for (const product of products) {
      const onHand = product.stockItems.reduce((sum, item) => sum + Number(item.quantityOnHand), 0);
      const minLevel = Number(product.minStockLevel);
      if (onHand < minLevel) {
        rows.push({ productId: product.id, name: product.name, onHand, minStockLevel: minLevel });
      }
    }
    return rows.slice(0, 50);
  }

  async getSalesTrend(
    companyId: string,
    months: number,
  ): Promise<{ month: string; total: number }[]> {
    const since = new Date();
    since.setMonth(since.getMonth() - (months - 1));
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const invoices = await this.prisma.salesInvoice.findMany({
      where: { companyId, status: { not: InvoiceStatus.CANCELLED }, issueDate: { gte: since } },
      select: { issueDate: true, total: true },
    });

    const buckets = new Map<string, number>();
    for (let i = 0; i < months; i += 1) {
      const date = new Date(since);
      date.setMonth(since.getMonth() + i);
      buckets.set(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`, 0);
    }

    for (const invoice of invoices) {
      const key = `${invoice.issueDate.getFullYear()}-${String(invoice.issueDate.getMonth() + 1).padStart(2, '0')}`;
      buckets.set(key, (buckets.get(key) ?? 0) + Number(invoice.total));
    }

    return Array.from(buckets.entries()).map(([month, total]) => ({ month, total }));
  }
}
