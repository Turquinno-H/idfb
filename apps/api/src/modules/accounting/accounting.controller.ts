import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChartOfAccountsService } from './accounts.service';
import { JournalEntriesService } from './journal-entries.service';
import { CreateAccountDto, CreateJournalEntryDto, UpdateAccountDto } from './dto/accounting.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.interface';

@ApiTags('accounting')
@ApiBearerAuth()
@Controller()
export class AccountingController {
  constructor(
    private readonly accountsService: ChartOfAccountsService,
    private readonly journalService: JournalEntriesService,
  ) {}

  // Chart of accounts
  @Post('accounts')
  @RequirePermissions({ resource: 'account', action: 'create' })
  @Audit('create', 'Account')
  @ApiOperation({ summary: 'Create a chart-of-accounts account' })
  createAccount(@TenantCompanyId() companyId: string, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(companyId, dto);
  }

  @Get('accounts')
  @RequirePermissions({ resource: 'account', action: 'read' })
  @ApiOperation({ summary: 'List accounts' })
  listAccounts(@TenantCompanyId() companyId: string, @Query() query: PaginationQueryDto) {
    return this.accountsService.findAll(companyId, query);
  }

  @Get('accounts/:id')
  @RequirePermissions({ resource: 'account', action: 'read' })
  @ApiOperation({ summary: 'Get an account by id' })
  getAccount(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.accountsService.findOne(companyId, id);
  }

  @Patch('accounts/:id')
  @RequirePermissions({ resource: 'account', action: 'update' })
  @Audit('update', 'Account')
  @ApiOperation({ summary: 'Update an account' })
  updateAccount(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(companyId, id, dto);
  }

  @Delete('accounts/:id')
  @RequirePermissions({ resource: 'account', action: 'delete' })
  @Audit('delete', 'Account')
  @ApiOperation({ summary: 'Delete an account' })
  removeAccount(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.accountsService.remove(companyId, id);
  }

  // Journal entries
  @Post('journal-entries')
  @RequirePermissions({ resource: 'journal_entry', action: 'create' })
  @Audit('create', 'JournalEntry')
  @ApiOperation({ summary: 'Create a balanced double-entry journal entry' })
  createEntry(
    @TenantCompanyId() companyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateJournalEntryDto,
  ) {
    return this.journalService.create(companyId, user.userId, dto);
  }

  @Get('journal-entries')
  @RequirePermissions({ resource: 'journal_entry', action: 'read' })
  @ApiOperation({ summary: 'List journal entries' })
  listEntries(@TenantCompanyId() companyId: string, @Query() query: PaginationQueryDto) {
    return this.journalService.findAll(companyId, query);
  }

  @Get('journal-entries/trial-balance')
  @RequirePermissions({ resource: 'journal_entry', action: 'read' })
  @ApiOperation({ summary: 'Compute the trial balance from posted entries' })
  trialBalance(@TenantCompanyId() companyId: string) {
    return this.journalService.trialBalance(companyId);
  }

  @Get('journal-entries/:id')
  @RequirePermissions({ resource: 'journal_entry', action: 'read' })
  @ApiOperation({ summary: 'Get a journal entry by id' })
  getEntry(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.journalService.findOne(companyId, id);
  }

  @Post('journal-entries/:id/post')
  @RequirePermissions({ resource: 'journal_entry', action: 'approve' })
  @Audit('post', 'JournalEntry')
  @ApiOperation({ summary: 'Post a draft journal entry to the ledger' })
  postEntry(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.journalService.post(companyId, id);
  }
}
