import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SalesOrdersService } from './sales-orders.service';
import { CreateSalesOrderDto, UpdateSalesOrderDto } from './dto/sales.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.interface';

@ApiTags('sales-orders')
@ApiBearerAuth()
@Controller('sales-orders')
export class SalesOrdersController {
  constructor(private readonly service: SalesOrdersService) {}

  @Post()
  @RequirePermissions({ resource: 'sales_order', action: 'create' })
  @Audit('create', 'SalesOrder')
  @ApiOperation({ summary: 'Create a sales order' })
  create(
    @TenantCompanyId() companyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSalesOrderDto,
  ) {
    return this.service.create(companyId, user.userId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'sales_order', action: 'read' })
  @ApiOperation({ summary: 'List sales orders' })
  findAll(@TenantCompanyId() companyId: string, @Query() query: PaginationQueryDto) {
    return this.service.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'sales_order', action: 'read' })
  @ApiOperation({ summary: 'Get a sales order by id' })
  findOne(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'sales_order', action: 'update' })
  @Audit('update', 'SalesOrder')
  @ApiOperation({ summary: 'Update a draft sales order' })
  update(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSalesOrderDto,
  ) {
    return this.service.update(companyId, id, dto);
  }

  @Post(':id/confirm')
  @RequirePermissions({ resource: 'sales_order', action: 'approve' })
  @Audit('confirm', 'SalesOrder')
  @ApiOperation({ summary: 'Confirm a sales order' })
  confirm(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.confirm(companyId, id);
  }

  @Post(':id/deliver')
  @RequirePermissions({ resource: 'sales_order', action: 'update' })
  @Audit('deliver', 'SalesOrder')
  @ApiOperation({ summary: 'Deliver a sales order (posts stock out)' })
  deliver(
    @TenantCompanyId() companyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.deliver(companyId, user.userId, id);
  }

  @Post(':id/cancel')
  @RequirePermissions({ resource: 'sales_order', action: 'update' })
  @Audit('cancel', 'SalesOrder')
  @ApiOperation({ summary: 'Cancel a sales order' })
  cancel(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.cancel(companyId, id);
  }
}
