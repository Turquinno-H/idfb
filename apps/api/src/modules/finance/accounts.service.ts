import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, BankTransactionType } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { resolveCompanyCurrency } from '../../common/util/company-currency';
import {
  CreateBankAccountDto,
  CreateBankTransactionDto,
  CreateCashAccountDto,
  UpdateBankAccountDto,
  UpdateCashAccountDto,
} from './dto/finance.dto';

type CashAccountEntity = Prisma.CashAccountGetPayload<{ include: { currency: true; branch: true } }>;
type BankAccountEntity = Prisma.BankAccountGetPayload<{
  include: { currency: true; bank: true; branch: true };
}>;

const INCOMING_BANK_TYPES: ReadonlySet<BankTransactionType> = new Set([
  BankTransactionType.DEPOSIT,
  BankTransactionType.TRANSFER_IN,
  BankTransactionType.INTEREST,
]);

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- Cash accounts ----

  async createCashAccount(companyId: string, dto: CreateCashAccountDto): Promise<CashAccountEntity> {
    const currencyId = await resolveCompanyCurrency(this.prisma, companyId, dto.currencyId);
    return this.prisma.cashAccount.create({
      data: {
        companyId,
        name: dto.name,
        branchId: dto.branchId,
        currencyId,
        openingBalance: dto.openingBalance ?? 0,
      },
      include: { currency: true, branch: true },
    });
  }

  async listCashAccounts(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<CashAccountEntity>> {
    const where: Prisma.CashAccountWhereInput = {
      companyId,
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.cashAccount.findMany({
        where,
        include: { currency: true, branch: true },
        orderBy: { name: 'asc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.cashAccount.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async getCashAccountBalance(
    companyId: string,
    id: string,
  ): Promise<{ cashAccountId: string; balance: number }> {
    const account = await this.prisma.cashAccount.findFirst({ where: { id, companyId } });
    if (!account) {
      throw new NotFoundException('Cash account not found');
    }
    const [collections, incomes, payments, expenses] = await this.prisma.$transaction([
      this.prisma.collection.aggregate({ where: { cashAccountId: id }, _sum: { amount: true } }),
      this.prisma.income.aggregate({ where: { cashAccountId: id }, _sum: { amount: true } }),
      this.prisma.payment.aggregate({ where: { cashAccountId: id }, _sum: { amount: true } }),
      this.prisma.expense.aggregate({ where: { cashAccountId: id }, _sum: { amount: true } }),
    ]);
    const balance =
      Number(account.openingBalance) +
      Number(collections._sum.amount ?? 0) +
      Number(incomes._sum.amount ?? 0) -
      Number(payments._sum.amount ?? 0) -
      Number(expenses._sum.amount ?? 0);
    return { cashAccountId: id, balance };
  }

  async updateCashAccount(
    companyId: string,
    id: string,
    dto: UpdateCashAccountDto,
  ): Promise<CashAccountEntity> {
    const account = await this.prisma.cashAccount.findFirst({ where: { id, companyId } });
    if (!account) {
      throw new NotFoundException('Cash account not found');
    }
    return this.prisma.cashAccount.update({
      where: { id },
      data: {
        name: dto.name,
        branchId: dto.branchId,
        currencyId: dto.currencyId,
        openingBalance: dto.openingBalance,
      },
      include: { currency: true, branch: true },
    });
  }

  // ---- Bank accounts ----

  async createBankAccount(companyId: string, dto: CreateBankAccountDto): Promise<BankAccountEntity> {
    const bank = await this.prisma.bank.findFirst({ where: { id: dto.bankId, companyId } });
    if (!bank) {
      throw new NotFoundException('Bank not found');
    }
    const currencyId = await resolveCompanyCurrency(this.prisma, companyId, dto.currencyId);
    return this.prisma.bankAccount.create({
      data: {
        companyId,
        bankId: dto.bankId,
        iban: dto.iban,
        accountNumber: dto.accountNumber,
        branchId: dto.branchId,
        currencyId,
        openingBalance: dto.openingBalance ?? 0,
      },
      include: { currency: true, bank: true, branch: true },
    });
  }

  async listBankAccounts(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<BankAccountEntity>> {
    const where: Prisma.BankAccountWhereInput = {
      companyId,
      ...(query.search ? { iban: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.bankAccount.findMany({
        where,
        include: { currency: true, bank: true, branch: true },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.bankAccount.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async updateBankAccount(
    companyId: string,
    id: string,
    dto: UpdateBankAccountDto,
  ): Promise<BankAccountEntity> {
    const account = await this.prisma.bankAccount.findFirst({ where: { id, companyId } });
    if (!account) {
      throw new NotFoundException('Bank account not found');
    }
    return this.prisma.bankAccount.update({
      where: { id },
      data: {
        bankId: dto.bankId,
        iban: dto.iban,
        accountNumber: dto.accountNumber,
        branchId: dto.branchId,
        currencyId: dto.currencyId,
        openingBalance: dto.openingBalance,
      },
      include: { currency: true, bank: true, branch: true },
    });
  }

  // ---- Bank transactions ----

  async createBankTransaction(
    companyId: string,
    dto: CreateBankTransactionDto,
  ): Promise<Prisma.BankTransactionGetPayload<Record<string, never>>> {
    const account = await this.prisma.bankAccount.findFirst({
      where: { id: dto.bankAccountId, companyId },
    });
    if (!account) {
      throw new NotFoundException('Bank account not found');
    }
    return this.prisma.bankTransaction.create({
      data: {
        companyId,
        bankAccountId: dto.bankAccountId,
        type: dto.type,
        amount: dto.amount,
        transactionDate: dto.transactionDate ? new Date(dto.transactionDate) : undefined,
        description: dto.description,
        reference: dto.reference,
      },
    });
  }

  async listBankTransactions(
    companyId: string,
    bankAccountId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Prisma.BankTransactionGetPayload<Record<string, never>>>> {
    const where: Prisma.BankTransactionWhereInput = { companyId, bankAccountId };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.bankTransaction.findMany({
        where,
        orderBy: { transactionDate: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.bankTransaction.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async getBankAccountBalance(
    companyId: string,
    id: string,
  ): Promise<{ bankAccountId: string; balance: number }> {
    const account = await this.prisma.bankAccount.findFirst({ where: { id, companyId } });
    if (!account) {
      throw new NotFoundException('Bank account not found');
    }
    const transactions = await this.prisma.bankTransaction.findMany({
      where: { bankAccountId: id },
      select: { type: true, amount: true },
    });
    let balance = Number(account.openingBalance);
    for (const transaction of transactions) {
      const amount = Number(transaction.amount);
      balance += INCOMING_BANK_TYPES.has(transaction.type) ? amount : -amount;
    }
    return { bankAccountId: id, balance };
  }
}
