import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @RequirePermissions({ resource: 'customer', action: 'create' })
  @Audit('create', 'Customer')
  @ApiOperation({ summary: 'Create a customer' })
  create(@TenantCompanyId() companyId: string, @Body() dto: CreateCustomerDto) {
    return this.customersService.create(companyId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'customer', action: 'read' })
  @ApiOperation({ summary: 'List customers' })
  findAll(@TenantCompanyId() companyId: string, @Query() query: PaginationQueryDto) {
    return this.customersService.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'customer', action: 'read' })
  @ApiOperation({ summary: 'Get a customer by id' })
  findOne(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.findOne(companyId, id);
  }

  @Get(':id/statement')
  @RequirePermissions({ resource: 'customer', action: 'read' })
  @ApiOperation({ summary: 'Get a customer receivables statement (invoices vs collections)' })
  statement(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.getStatement(companyId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'customer', action: 'update' })
  @Audit('update', 'Customer')
  @ApiOperation({ summary: 'Update a customer' })
  update(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'customer', action: 'delete' })
  @Audit('delete', 'Customer')
  @ApiOperation({ summary: 'Delete a customer' })
  remove(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.remove(companyId, id);
  }
}
