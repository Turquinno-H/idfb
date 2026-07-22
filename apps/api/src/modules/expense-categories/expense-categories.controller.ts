import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExpenseCategoriesService } from './expense-categories.service';
import { CreateExpenseCategoryDto, UpdateExpenseCategoryDto } from './dto/expense-categories.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('expense-categories')
@ApiBearerAuth()
@Controller('expense-categories')
export class ExpenseCategoriesController {
  constructor(private readonly service: ExpenseCategoriesService) {}

  @Post()
  @RequirePermissions({ resource: 'expense', action: 'create' })
  @Audit('create', 'ExpenseCategory')
  @ApiOperation({ summary: 'Create ExpenseCategory' })
  create(@TenantCompanyId() companyId: string, @Body() dto: CreateExpenseCategoryDto) {
    return this.service.create(companyId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'expense', action: 'read' })
  @ApiOperation({ summary: 'List ExpenseCategory records' })
  findAll(@TenantCompanyId() companyId: string, @Query() query: PaginationQueryDto) {
    return this.service.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'expense', action: 'read' })
  @ApiOperation({ summary: 'Get ExpenseCategory by id' })
  findOne(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'expense', action: 'update' })
  @Audit('update', 'ExpenseCategory')
  @ApiOperation({ summary: 'Update ExpenseCategory' })
  update(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExpenseCategoryDto,
  ) {
    return this.service.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'expense', action: 'delete' })
  @Audit('delete', 'ExpenseCategory')
  @ApiOperation({ summary: 'Delete ExpenseCategory' })
  remove(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(companyId, id);
  }
}
