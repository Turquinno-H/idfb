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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('suppliers')
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @RequirePermissions({ resource: 'supplier', action: 'create' })
  @Audit('create', 'Supplier')
  @ApiOperation({ summary: 'Create a supplier' })
  create(@TenantCompanyId() companyId: string, @Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(companyId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'supplier', action: 'read' })
  @ApiOperation({ summary: 'List suppliers' })
  findAll(
    @TenantCompanyId() companyId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.suppliersService.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'supplier', action: 'read' })
  @ApiOperation({ summary: 'Get a supplier by id' })
  findOne(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.suppliersService.findOne(companyId, id);
  }

  @Get(':id/statement')
  @RequirePermissions({ resource: 'supplier', action: 'read' })
  @ApiOperation({
    summary: 'Get a supplier payables statement (invoices vs payments)',
  })
  statement(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.suppliersService.getStatement(companyId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'supplier', action: 'update' })
  @Audit('update', 'Supplier')
  @ApiOperation({ summary: 'Update a supplier' })
  update(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'supplier', action: 'delete' })
  @Audit('delete', 'Supplier')
  @ApiOperation({ summary: 'Delete a supplier' })
  remove(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.suppliersService.remove(companyId, id);
  }
}
