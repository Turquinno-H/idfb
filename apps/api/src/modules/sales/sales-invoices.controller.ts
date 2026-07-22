import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SalesInvoicesService } from './sales-invoices.service';
import { CreateSalesInvoiceDto } from './dto/sales.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.interface';

@ApiTags('sales-invoices')
@ApiBearerAuth()
@Controller('sales-invoices')
export class SalesInvoicesController {
  constructor(private readonly service: SalesInvoicesService) {}

  @Post()
  @RequirePermissions({ resource: 'sales_invoice', action: 'create' })
  @Audit('create', 'SalesInvoice')
  @ApiOperation({ summary: 'Create a sales invoice with computed totals' })
  create(
    @TenantCompanyId() companyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSalesInvoiceDto,
  ) {
    return this.service.create(companyId, user.userId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'sales_invoice', action: 'read' })
  @ApiOperation({ summary: 'List sales invoices' })
  findAll(@TenantCompanyId() companyId: string, @Query() query: PaginationQueryDto) {
    return this.service.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'sales_invoice', action: 'read' })
  @ApiOperation({ summary: 'Get a sales invoice by id' })
  findOne(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(companyId, id);
  }

  @Post(':id/approve')
  @RequirePermissions({ resource: 'sales_invoice', action: 'approve' })
  @Audit('approve', 'SalesInvoice')
  @ApiOperation({ summary: 'Approve a sales invoice' })
  approve(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.approve(companyId, id);
  }

  @Post(':id/cancel')
  @RequirePermissions({ resource: 'sales_invoice', action: 'update' })
  @Audit('cancel', 'SalesInvoice')
  @ApiOperation({ summary: 'Cancel a sales invoice' })
  cancel(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.cancel(companyId, id);
  }
}
