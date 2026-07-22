import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JournalEntryStatus, Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PaginationQueryDto,
  paginate,
  PaginatedResult,
} from '../../common/dto/pagination.dto';
import { nextDocumentNumber } from '../../common/util/document-number';
import { CreateJournalEntryDto } from './dto/accounting.dto';

type JournalEntryEntity = Prisma.JournalEntryGetPayload<{
  include: { lines: { include: { account: true; costCenter: true } } };
}>;

const JE_INCLUDE = {
  lines: { include: { account: true, costCenter: true } },
} satisfies Prisma.JournalEntryInclude;

function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
}

@Injectable()
export class JournalEntriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a balanced double-entry journal entry. Rejects entries whose total
   * debits do not equal total credits, and lines that are both/neither debit
   * nor credit. All referenced accounts must belong to the company.
   */
  async create(
    companyId: string,
    userId: string,
    dto: CreateJournalEntryDto,
  ): Promise<JournalEntryEntity> {
    let totalDebit = 0;
    let totalCredit = 0;
    for (const line of dto.lines) {
      if (
        (line.debit > 0 && line.credit > 0) ||
        (line.debit === 0 && line.credit === 0)
      ) {
        throw new BadRequestException(
          'Each journal line must be either a debit or a credit, not both or neither',
        );
      }
      totalDebit += line.debit;
      totalCredit += line.credit;
    }

    if (round(totalDebit) !== round(totalCredit)) {
      throw new BadRequestException(
        `Journal entry is not balanced: debit ${round(totalDebit)} != credit ${round(totalCredit)}`,
      );
    }

    const accountIds = [...new Set(dto.lines.map((l) => l.accountId))];
    const accounts = await this.prisma.account.findMany({
      where: { companyId, id: { in: accountIds } },
      select: { id: true },
    });
    if (accounts.length !== accountIds.length) {
      throw new BadRequestException(
        'One or more accounts do not belong to this company',
      );
    }

    const entryNumber = await nextDocumentNumber(
      this.prisma.journalEntry,
      companyId,
      'YEV',
    );

    return this.prisma.journalEntry.create({
      data: {
        companyId,
        branchId: dto.branchId,
        entryNumber,
        entryDate: dto.entryDate ? new Date(dto.entryDate) : undefined,
        description: dto.description,
        status: JournalEntryStatus.DRAFT,
        createdByUserId: userId,
        lines: {
          create: dto.lines.map((line) => ({
            accountId: line.accountId,
            costCenterId: line.costCenterId,
            debit: line.debit,
            credit: line.credit,
            description: line.description,
          })),
        },
      },
      include: JE_INCLUDE,
    });
  }

  async findAll(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<JournalEntryEntity>> {
    const where: Prisma.JournalEntryWhereInput = {
      companyId,
      ...(query.search
        ? { entryNumber: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.journalEntry.findMany({
        where,
        include: JE_INCLUDE,
        orderBy: { entryDate: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.journalEntry.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async findOne(companyId: string, id: string): Promise<JournalEntryEntity> {
    const entry = await this.prisma.journalEntry.findFirst({
      where: { id, companyId },
      include: JE_INCLUDE,
    });
    if (!entry) {
      throw new NotFoundException('Journal entry not found');
    }
    return entry;
  }

  async post(companyId: string, id: string): Promise<JournalEntryEntity> {
    const entry = await this.findOne(companyId, id);
    if (entry.status !== JournalEntryStatus.DRAFT) {
      throw new BadRequestException('Only draft journal entries can be posted');
    }
    await this.prisma.journalEntry.update({
      where: { id },
      data: { status: JournalEntryStatus.POSTED, postedAt: new Date() },
    });
    return this.findOne(companyId, id);
  }

  /** Aggregates posted journal activity per account into a trial balance. */
  async trialBalance(companyId: string): Promise<{
    accounts: {
      accountId: string;
      code: string;
      name: string;
      debit: number;
      credit: number;
      balance: number;
    }[];
    totalDebit: number;
    totalCredit: number;
  }> {
    const grouped = await this.prisma.journalEntryLine.groupBy({
      by: ['accountId'],
      where: { journalEntry: { companyId, status: JournalEntryStatus.POSTED } },
      _sum: { debit: true, credit: true },
    });

    const accountIds = grouped.map((g) => g.accountId);
    const accounts = await this.prisma.account.findMany({
      where: { id: { in: accountIds } },
      select: { id: true, code: true, name: true },
    });
    const accountMap = new Map(accounts.map((a) => [a.id, a]));

    let totalDebit = 0;
    let totalCredit = 0;
    const rows = grouped.map((group) => {
      const debit = Number(group._sum.debit ?? 0);
      const credit = Number(group._sum.credit ?? 0);
      totalDebit += debit;
      totalCredit += credit;
      const account = accountMap.get(group.accountId);
      return {
        accountId: group.accountId,
        code: account?.code ?? '',
        name: account?.name ?? '',
        debit,
        credit,
        balance: round(debit - credit),
      };
    });

    rows.sort((a, b) => a.code.localeCompare(b.code));

    return {
      accounts: rows,
      totalDebit: round(totalDebit),
      totalCredit: round(totalCredit),
    };
  }
}
