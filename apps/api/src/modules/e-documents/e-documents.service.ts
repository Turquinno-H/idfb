import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  EDocumentProfile,
  EDocumentStatus,
  Prisma,
  WaybillDirection,
} from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PaginationQueryDto,
  paginate,
  PaginatedResult,
} from '../../common/dto/pagination.dto';
import { IssueEInvoiceDto, IssueEWaybillDto } from './dto/e-documents.dto';

type EInvoiceEntity = Prisma.EInvoiceGetPayload<{
  include: { salesInvoice: true };
}>;
type EWaybillEntity = Prisma.EWaybillGetPayload<{ include: { waybill: true } }>;

/**
 * E-Transformation (GİB) document service. Prepares UBL-TR-compatible document
 * metadata (UUID/ETTN, profile) and drives the local status lifecycle. Actual
 * transmission to a GİB integrator (private entegratör or the public portal)
 * requires paid credentials and is performed by a queued worker that calls the
 * configured provider; until credentials are supplied documents remain QUEUED.
 */
@Injectable()
export class EDocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async issueEInvoice(
    companyId: string,
    dto: IssueEInvoiceDto,
  ): Promise<EInvoiceEntity> {
    const invoice = await this.prisma.salesInvoice.findFirst({
      where: { id: dto.salesInvoiceId, companyId },
    });
    if (!invoice) {
      throw new NotFoundException('Sales invoice not found');
    }

    const existing = await this.prisma.eInvoice.findUnique({
      where: { salesInvoiceId: dto.salesInvoiceId },
    });
    if (existing) {
      throw new BadRequestException(
        'An e-document already exists for this invoice',
      );
    }

    return this.prisma.eInvoice.create({
      data: {
        salesInvoiceId: dto.salesInvoiceId,
        uuid: randomUUID(),
        profileId: dto.profileId ?? EDocumentProfile.TEMEL_FATURA,
        status: EDocumentStatus.QUEUED,
      },
      include: { salesInvoice: true },
    });
  }

  async listEInvoices(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<EInvoiceEntity>> {
    const where: Prisma.EInvoiceWhereInput = { salesInvoice: { companyId } };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.eInvoice.findMany({
        where,
        include: { salesInvoice: true },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.eInvoice.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async getEInvoice(companyId: string, id: string): Promise<EInvoiceEntity> {
    const eInvoice = await this.prisma.eInvoice.findFirst({
      where: { id, salesInvoice: { companyId } },
      include: { salesInvoice: true },
    });
    if (!eInvoice) {
      throw new NotFoundException('E-invoice not found');
    }
    return eInvoice;
  }

  async cancelEInvoice(companyId: string, id: string): Promise<EInvoiceEntity> {
    const eInvoice = await this.getEInvoice(companyId, id);
    if (eInvoice.status === EDocumentStatus.ACCEPTED) {
      throw new BadRequestException(
        'Accepted e-invoices cannot be cancelled locally',
      );
    }
    await this.prisma.eInvoice.update({
      where: { id },
      data: { status: EDocumentStatus.CANCELLED },
    });
    return this.getEInvoice(companyId, id);
  }

  async issueEWaybill(
    companyId: string,
    dto: IssueEWaybillDto,
  ): Promise<EWaybillEntity> {
    const waybill = await this.prisma.waybill.findFirst({
      where: { id: dto.waybillId, companyId },
    });
    if (!waybill) {
      throw new NotFoundException('Waybill not found');
    }
    if (waybill.direction !== WaybillDirection.OUTBOUND) {
      throw new BadRequestException(
        'Only outbound waybills can be issued as e-waybills',
      );
    }
    const existing = await this.prisma.eWaybill.findUnique({
      where: { waybillId: dto.waybillId },
    });
    if (existing) {
      throw new BadRequestException(
        'An e-waybill already exists for this waybill',
      );
    }

    return this.prisma.eWaybill.create({
      data: {
        waybillId: dto.waybillId,
        uuid: randomUUID(),
        status: EDocumentStatus.QUEUED,
        vehiclePlate: dto.vehiclePlate,
        driverName: dto.driverName,
        shipmentDate: dto.shipmentDate ? new Date(dto.shipmentDate) : undefined,
      },
      include: { waybill: true },
    });
  }

  async listEWaybills(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<EWaybillEntity>> {
    const where: Prisma.EWaybillWhereInput = { waybill: { companyId } };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.eWaybill.findMany({
        where,
        include: { waybill: true },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.eWaybill.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }
}
