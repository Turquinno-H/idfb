import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceStatus, Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { resolveCompanyCurrency } from '../../common/util/company-currency';
import { CreatePaymentDto } from './dto/finance.dto';

type PaymentEntity = Prisma.PaymentGetPayload<{
  include: { supplier: true; paymentMethod: true; currency: true };
}>;

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records a supplier payment. When linked to a purchase invoice, the
   * invoice's paid amount and status are updated atomically and the payment
   * may not exceed the outstanding balance.
   */
  async create(companyId: string, userId: string, dto: CreatePaymentDto): Promise<PaymentEntity> {
    const supplier = await this.prisma.supplier.findFirst({ where: { id: dto.supplierId, companyId } });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    const currencyId = await resolveCompanyCurrency(this.prisma, companyId, dto.currencyId);

    return this.prisma.$transaction(async (tx) => {
      if (dto.purchaseInvoiceId) {
        const invoice = await tx.purchaseInvoice.findFirst({
          where: { id: dto.purchaseInvoiceId, companyId },
        });
        if (!invoice) {
          throw new NotFoundException('Purchase invoice not found');
        }
        if (invoice.status === InvoiceStatus.CANCELLED) {
          throw new BadRequestException('Cannot pay against a cancelled invoice');
        }
        const outstanding = Number(invoice.total) - Number(invoice.paidAmount);
        if (dto.amount > outstanding + 1e-6) {
          throw new BadRequestException(
            `Payment ${dto.amount} exceeds invoice outstanding balance ${outstanding}`,
          );
        }
        const newPaid = Number(invoice.paidAmount) + dto.amount;
        const fullyPaid = newPaid >= Number(invoice.total) - 1e-6;
        await tx.purchaseInvoice.update({
          where: { id: invoice.id },
          data: {
            paidAmount: newPaid,
            status: fullyPaid ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID,
          },
        });
      }

      return tx.payment.create({
        data: {
          companyId,
          supplierId: dto.supplierId,
          purchaseInvoiceId: dto.purchaseInvoiceId,
          paymentMethodId: dto.paymentMethodId,
          cashAccountId: dto.cashAccountId,
          bankAccountId: dto.bankAccountId,
          amount: dto.amount,
          currencyId,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
          note: dto.note,
          createdByUserId: userId,
        },
        include: { supplier: true, paymentMethod: true, currency: true },
      });
    });
  }

  async findAll(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<PaymentEntity>> {
    const where: Prisma.PaymentWhereInput = { companyId };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        include: { supplier: true, paymentMethod: true, currency: true },
        orderBy: { paymentDate: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.payment.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<PaymentEntity> {
    const payment = await this.prisma.payment.findFirst({
      where: { id, companyId },
      include: { supplier: true, paymentMethod: true, currency: true },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }
}
