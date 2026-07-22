import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PurchaseInvoicesService } from './purchase-invoices.service';
import { CreatePurchaseInvoiceDto } from './dto/purchase-invoice.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.interface';

@ApiTags('purchase-invoices')
@ApiBearerAuth()
@Controller('purchase-invoices')
export class PurchaseInvoicesController {
  constructor(private readonly service: PurchaseInvoicesService) {}

  @Post()
  @RequirePermissions({ resource: 'purchase_invoice', action: 'create' })
  @Audit('create', 'PurchaseInvoice')
  @ApiOperation({ summary: 'Create a purchase invoice with computed totals' })
  create(
    @TenantCompanyId() companyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePurchaseInvoiceDto,
  ) {
    return this.service.create(companyId, user.userId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'purchase_invoice', action: 'read' })
  @ApiOperation({ summary: 'List purchase invoices' })
  findAll(
    @TenantCompanyId() companyId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'purchase_invoice', action: 'read' })
  @ApiOperation({ summary: 'Get a purchase invoice by id' })
  findOne(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(companyId, id);
  }

  @Post(':id/approve')
  @RequirePermissions({ resource: 'purchase_invoice', action: 'approve' })
  @Audit('approve', 'PurchaseInvoice')
  @ApiOperation({ summary: 'Approve a purchase invoice' })
  approve(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.approve(companyId, id);
  }
}
