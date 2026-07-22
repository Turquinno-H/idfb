import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @RequirePermissions({ resource: 'product', action: 'create' })
  @Audit('create', 'Product')
  @ApiOperation({ summary: 'Create a product' })
  create(@TenantCompanyId() companyId: string, @Body() dto: CreateProductDto) {
    return this.productsService.create(companyId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'product', action: 'read' })
  @ApiOperation({ summary: 'List products' })
  findAll(@TenantCompanyId() companyId: string, @Query() query: PaginationQueryDto) {
    return this.productsService.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'product', action: 'read' })
  @ApiOperation({ summary: 'Get a product by id' })
  findOne(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'product', action: 'update' })
  @Audit('update', 'Product')
  @ApiOperation({ summary: 'Update a product' })
  update(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'product', action: 'delete' })
  @Audit('delete', 'Product')
  @ApiOperation({ summary: 'Delete a product' })
  remove(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(companyId, id);
  }
}
