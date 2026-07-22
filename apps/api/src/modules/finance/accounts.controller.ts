import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import {
  CreateBankAccountDto,
  CreateBankTransactionDto,
  CreateCashAccountDto,
  UpdateBankAccountDto,
  UpdateCashAccountDto,
} from './dto/finance.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('finance-accounts')
@ApiBearerAuth()
@Controller('finance')
export class AccountsController {
  constructor(private readonly service: AccountsService) {}

  // Cash accounts
  @Post('cash-accounts')
  @RequirePermissions({ resource: 'cash_account', action: 'create' })
  @Audit('create', 'CashAccount')
  @ApiOperation({ summary: 'Create a cash account' })
  createCash(@TenantCompanyId() companyId: string, @Body() dto: CreateCashAccountDto) {
    return this.service.createCashAccount(companyId, dto);
  }

  @Get('cash-accounts')
  @RequirePermissions({ resource: 'cash_account', action: 'read' })
  @ApiOperation({ summary: 'List cash accounts' })
  listCash(@TenantCompanyId() companyId: string, @Query() query: PaginationQueryDto) {
    return this.service.listCashAccounts(companyId, query);
  }

  @Get('cash-accounts/:id/balance')
  @RequirePermissions({ resource: 'cash_account', action: 'read' })
  @ApiOperation({ summary: 'Get a cash account computed balance' })
  cashBalance(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.getCashAccountBalance(companyId, id);
  }

  @Patch('cash-accounts/:id')
  @RequirePermissions({ resource: 'cash_account', action: 'update' })
  @Audit('update', 'CashAccount')
  @ApiOperation({ summary: 'Update a cash account' })
  updateCash(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCashAccountDto,
  ) {
    return this.service.updateCashAccount(companyId, id, dto);
  }

  // Bank accounts
  @Post('bank-accounts')
  @RequirePermissions({ resource: 'bank_account', action: 'create' })
  @Audit('create', 'BankAccount')
  @ApiOperation({ summary: 'Create a bank account' })
  createBank(@TenantCompanyId() companyId: string, @Body() dto: CreateBankAccountDto) {
    return this.service.createBankAccount(companyId, dto);
  }

  @Get('bank-accounts')
  @RequirePermissions({ resource: 'bank_account', action: 'read' })
  @ApiOperation({ summary: 'List bank accounts' })
  listBank(@TenantCompanyId() companyId: string, @Query() query: PaginationQueryDto) {
    return this.service.listBankAccounts(companyId, query);
  }

  @Get('bank-accounts/:id/balance')
  @RequirePermissions({ resource: 'bank_account', action: 'read' })
  @ApiOperation({ summary: 'Get a bank account computed balance' })
  bankBalance(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.getBankAccountBalance(companyId, id);
  }

  @Patch('bank-accounts/:id')
  @RequirePermissions({ resource: 'bank_account', action: 'update' })
  @Audit('update', 'BankAccount')
  @ApiOperation({ summary: 'Update a bank account' })
  updateBank(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBankAccountDto,
  ) {
    return this.service.updateBankAccount(companyId, id, dto);
  }

  // Bank transactions
  @Post('bank-transactions')
  @RequirePermissions({ resource: 'bank_account', action: 'update' })
  @Audit('create', 'BankTransaction')
  @ApiOperation({ summary: 'Record a bank transaction' })
  createBankTransaction(
    @TenantCompanyId() companyId: string,
    @Body() dto: CreateBankTransactionDto,
  ) {
    return this.service.createBankTransaction(companyId, dto);
  }

  @Get('bank-accounts/:id/transactions')
  @RequirePermissions({ resource: 'bank_account', action: 'read' })
  @ApiOperation({ summary: 'List a bank account transactions' })
  listBankTransactions(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.listBankTransactions(companyId, id, query);
  }
}
