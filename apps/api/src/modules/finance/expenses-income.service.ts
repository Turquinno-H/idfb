import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { resolveCompanyCurrency } from '../../common/util/company-currency';
import { CreateExpenseDto, CreateIncomeDto } from './dto/finance.dto';

type ExpenseEntity = Prisma.ExpenseGetPayload<{ include: { expenseCategory: true; currency: true } }>;
type IncomeEntity = Prisma.IncomeGetPayload<{ include: { incomeCategory: true; currency: true } }>;

@Injectable()
export class ExpensesIncomeService {
  constructor(private readonly prisma: PrismaService) {}

  async createExpense(companyId: string, userId: string, dto: CreateExpenseDto): Promise<ExpenseEntity> {
    const category = await this.prisma.expenseCategory.findFirst({
      where: { id: dto.expenseCategoryId, companyId },
    });
    if (!category) {
      throw new NotFoundException('Expense category not found');
    }
    const currencyId = await resolveCompanyCurrency(this.prisma, companyId, dto.currencyId);
    return this.prisma.expense.create({
      data: {
        companyId,
        expenseCategoryId: dto.expenseCategoryId,
        branchId: dto.branchId,
        costCenterId: dto.costCenterId,
        cashAccountId: dto.cashAccountId,
        bankAccountId: dto.bankAccountId,
        amount: dto.amount,
        currencyId,
        expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : undefined,
        description: dto.description,
        createdByUserId: userId,
      },
      include: { expenseCategory: true, currency: true },
    });
  }

  async listExpenses(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<ExpenseEntity>> {
    const where: Prisma.ExpenseWhereInput = {
      companyId,
      ...(query.search ? { description: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.expense.findMany({
        where,
        include: { expenseCategory: true, currency: true },
        orderBy: { expenseDate: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.expense.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async createIncome(companyId: string, userId: string, dto: CreateIncomeDto): Promise<IncomeEntity> {
    const category = await this.prisma.incomeCategory.findFirst({
      where: { id: dto.incomeCategoryId, companyId },
    });
    if (!category) {
      throw new NotFoundException('Income category not found');
    }
    const currencyId = await resolveCompanyCurrency(this.prisma, companyId, dto.currencyId);
    return this.prisma.income.create({
      data: {
        companyId,
        incomeCategoryId: dto.incomeCategoryId,
        branchId: dto.branchId,
        cashAccountId: dto.cashAccountId,
        bankAccountId: dto.bankAccountId,
        amount: dto.amount,
        currencyId,
        incomeDate: dto.incomeDate ? new Date(dto.incomeDate) : undefined,
        description: dto.description,
        createdByUserId: userId,
      },
      include: { incomeCategory: true, currency: true },
    });
  }

  async listIncome(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<IncomeEntity>> {
    const where: Prisma.IncomeWhereInput = {
      companyId,
      ...(query.search ? { description: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.income.findMany({
        where,
        include: { incomeCategory: true, currency: true },
        orderBy: { incomeDate: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.income.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }
}
