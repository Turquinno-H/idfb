import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { StockAdjustmentDto, StockTransferDto } from './dto/inventory.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.interface';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stock')
  @RequirePermissions({ resource: 'inventory', action: 'read' })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiOperation({
    summary: 'List current stock levels (optionally by warehouse)',
  })
  listStock(
    @TenantCompanyId() companyId: string,
    @Query() query: PaginationQueryDto,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.inventoryService.listStock(companyId, query, warehouseId);
  }

  @Get('movements')
  @RequirePermissions({ resource: 'stock_movement', action: 'read' })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'warehouseId', required: false })
  @ApiOperation({
    summary: 'List stock movements (audit trail of quantity changes)',
  })
  listMovements(
    @TenantCompanyId() companyId: string,
    @Query() query: PaginationQueryDto,
    @Query('productId') productId?: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.inventoryService.listMovements(
      companyId,
      query,
      productId,
      warehouseId,
    );
  }

  @Post('adjustments')
  @RequirePermissions({ resource: 'stock_movement', action: 'create' })
  @Audit('adjust', 'StockMovement')
  @ApiOperation({ summary: 'Create a manual stock adjustment (in/out)' })
  adjust(
    @TenantCompanyId() companyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: StockAdjustmentDto,
  ) {
    return this.inventoryService.adjust(companyId, {
      ...dto,
      userId: user.userId,
    });
  }

  @Post('transfers')
  @RequirePermissions({ resource: 'stock_transfer', action: 'create' })
  @Audit('transfer', 'StockTransfer')
  @ApiOperation({ summary: 'Transfer stock between two warehouses' })
  transfer(
    @TenantCompanyId() companyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: StockTransferDto,
  ) {
    return this.inventoryService.transfer(companyId, {
      ...dto,
      userId: user.userId,
    });
  }
}
