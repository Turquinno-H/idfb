import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvoiceStatus, Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PaginationQueryDto,
  paginate,
  PaginatedResult,
} from '../../common/dto/pagination.dto';
import { resolveCompanyCurrency } from '../../common/util/company-currency';
import { CreateCollectionDto } from './dto/finance.dto';

type CollectionEntity = Prisma.CollectionGetPayload<{
  include: { customer: true; paymentMethod: true; currency: true };
}>;

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records a customer collection. When linked to a sales invoice, the
   * invoice's paid amount and status (PAID / PARTIALLY_PAID) are updated
   * atomically. A collection may not exceed the invoice's outstanding balance.
   */
  async create(
    companyId: string,
    userId: string,
    dto: CreateCollectionDto,
  ): Promise<CollectionEntity> {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, companyId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    const currencyId = await resolveCompanyCurrency(
      this.prisma,
      companyId,
      dto.currencyId,
    );

    return this.prisma.$transaction(async (tx) => {
      if (dto.salesInvoiceId) {
        const invoice = await tx.salesInvoice.findFirst({
          where: { id: dto.salesInvoiceId, companyId },
        });
        if (!invoice) {
          throw new NotFoundException('Sales invoice not found');
        }
        if (invoice.status === InvoiceStatus.CANCELLED) {
          throw new BadRequestException(
            'Cannot collect against a cancelled invoice',
          );
        }
        const outstanding = Number(invoice.total) - Number(invoice.paidAmount);
        if (dto.amount > outstanding + 1e-6) {
          throw new BadRequestException(
            `Collection ${dto.amount} exceeds invoice outstanding balance ${outstanding}`,
          );
        }
        const newPaid = Number(invoice.paidAmount) + dto.amount;
        const fullyPaid = newPaid >= Number(invoice.total) - 1e-6;
        await tx.salesInvoice.update({
          where: { id: invoice.id },
          data: {
            paidAmount: newPaid,
            status: fullyPaid
              ? InvoiceStatus.PAID
              : InvoiceStatus.PARTIALLY_PAID,
          },
        });
      }

      return tx.collection.create({
        data: {
          companyId,
          customerId: dto.customerId,
          salesInvoiceId: dto.salesInvoiceId,
          paymentMethodId: dto.paymentMethodId,
          cashAccountId: dto.cashAccountId,
          bankAccountId: dto.bankAccountId,
          amount: dto.amount,
          currencyId,
          collectionDate: dto.collectionDate
            ? new Date(dto.collectionDate)
            : undefined,
          note: dto.note,
          createdByUserId: userId,
        },
        include: { customer: true, paymentMethod: true, currency: true },
      });
    });
  }

  async findAll(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<CollectionEntity>> {
    const where: Prisma.CollectionWhereInput = { companyId };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.collection.findMany({
        where,
        include: { customer: true, paymentMethod: true, currency: true },
        orderBy: { collectionDate: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.collection.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<CollectionEntity> {
    const collection = await this.prisma.collection.findFirst({
      where: { id, companyId },
      include: { customer: true, paymentMethod: true, currency: true },
    });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }
    return collection;
  }
}
