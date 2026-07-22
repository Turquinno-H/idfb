import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';
import {
  CreatePurchaseOrderDto,
  ReceivePurchaseOrderDto,
  UpdatePurchaseOrderDto,
} from './dto/purchase-order.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.interface';

@ApiTags('purchase-orders')
@ApiBearerAuth()
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly service: PurchaseOrdersService) {}

  @Post()
  @RequirePermissions({ resource: 'purchase_order', action: 'create' })
  @Audit('create', 'PurchaseOrder')
  @ApiOperation({ summary: 'Create a purchase order with line items' })
  create(
    @TenantCompanyId() companyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePurchaseOrderDto,
  ) {
    return this.service.create(companyId, user.userId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'purchase_order', action: 'read' })
  @ApiOperation({ summary: 'List purchase orders' })
  findAll(
    @TenantCompanyId() companyId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'purchase_order', action: 'read' })
  @ApiOperation({ summary: 'Get a purchase order by id' })
  findOne(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'purchase_order', action: 'update' })
  @Audit('update', 'PurchaseOrder')
  @ApiOperation({ summary: 'Update a draft purchase order' })
  update(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePurchaseOrderDto,
  ) {
    return this.service.update(companyId, id, dto);
  }

  @Post(':id/confirm')
  @RequirePermissions({ resource: 'purchase_order', action: 'approve' })
  @Audit('confirm', 'PurchaseOrder')
  @ApiOperation({ summary: 'Confirm a draft purchase order' })
  confirm(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.confirm(companyId, id);
  }

  @Post(':id/receive')
  @RequirePermissions({ resource: 'purchase_receipt', action: 'create' })
  @Audit('receive', 'PurchaseOrder')
  @ApiOperation({
    summary: 'Receive goods against a purchase order (posts stock in)',
  })
  receive(
    @TenantCompanyId() companyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReceivePurchaseOrderDto,
  ) {
    return this.service.receive(companyId, user.userId, id, dto);
  }

  @Post(':id/cancel')
  @RequirePermissions({ resource: 'purchase_order', action: 'update' })
  @Audit('cancel', 'PurchaseOrder')
  @ApiOperation({ summary: 'Cancel a purchase order' })
  cancel(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.cancel(companyId, id);
  }
}
