import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/warehouse.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('warehouses')
@ApiBearerAuth()
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  @RequirePermissions({ resource: 'warehouse', action: 'create' })
  @Audit('create', 'Warehouse')
  @ApiOperation({ summary: 'Create a warehouse' })
  create(
    @TenantCompanyId() companyId: string,
    @Body() dto: CreateWarehouseDto,
  ) {
    return this.warehousesService.create(companyId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'warehouse', action: 'read' })
  @ApiOperation({ summary: 'List warehouses' })
  findAll(
    @TenantCompanyId() companyId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.warehousesService.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'warehouse', action: 'read' })
  @ApiOperation({ summary: 'Get a warehouse by id' })
  findOne(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.warehousesService.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'warehouse', action: 'update' })
  @Audit('update', 'Warehouse')
  @ApiOperation({ summary: 'Update a warehouse' })
  update(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'warehouse', action: 'delete' })
  @Audit('delete', 'Warehouse')
  @ApiOperation({ summary: 'Delete a warehouse' })
  remove(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.warehousesService.remove(companyId, id);
  }
}
