import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('brands')
@ApiBearerAuth()
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @RequirePermissions({ resource: 'brand', action: 'create' })
  @Audit('create', 'Brand')
  create(@TenantCompanyId() companyId: string, @Body() dto: CreateBrandDto) {
    return this.brandsService.create(companyId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'brand', action: 'read' })
  findAll(@TenantCompanyId() companyId: string, @Query() query: PaginationQueryDto) {
    return this.brandsService.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'brand', action: 'read' })
  findOne(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.brandsService.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'brand', action: 'update' })
  @Audit('update', 'Brand')
  update(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBrandDto,
  ) {
    return this.brandsService.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'brand', action: 'delete' })
  @Audit('delete', 'Brand')
  remove(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.brandsService.remove(companyId, id);
  }
}
