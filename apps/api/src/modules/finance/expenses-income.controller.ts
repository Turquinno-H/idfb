import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExpensesIncomeService } from './expenses-income.service';
import { CreateExpenseDto, CreateIncomeDto } from './dto/finance.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.interface';

@ApiTags('expenses-income')
@ApiBearerAuth()
@Controller()
export class ExpensesIncomeController {
  constructor(private readonly service: ExpensesIncomeService) {}

  @Post('expenses')
  @RequirePermissions({ resource: 'expense', action: 'create' })
  @Audit('create', 'Expense')
  @ApiOperation({ summary: 'Record an expense' })
  createExpense(
    @TenantCompanyId() companyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.service.createExpense(companyId, user.userId, dto);
  }

  @Get('expenses')
  @RequirePermissions({ resource: 'expense', action: 'read' })
  @ApiOperation({ summary: 'List expenses' })
  listExpenses(@TenantCompanyId() companyId: string, @Query() query: PaginationQueryDto) {
    return this.service.listExpenses(companyId, query);
  }

  @Post('income')
  @RequirePermissions({ resource: 'income', action: 'create' })
  @Audit('create', 'Income')
  @ApiOperation({ summary: 'Record an income entry' })
  createIncome(
    @TenantCompanyId() companyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateIncomeDto,
  ) {
    return this.service.createIncome(companyId, user.userId, dto);
  }

  @Get('income')
  @RequirePermissions({ resource: 'income', action: 'read' })
  @ApiOperation({ summary: 'List income entries' })
  listIncome(@TenantCompanyId() companyId: string, @Query() query: PaginationQueryDto) {
    return this.service.listIncome(companyId, query);
  }
}
