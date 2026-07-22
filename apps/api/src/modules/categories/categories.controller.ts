import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @RequirePermissions({ resource: 'category', action: 'create' })
  @Audit('create', 'Category')
  @ApiOperation({ summary: 'Create a product category' })
  create(@TenantCompanyId() companyId: string, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(companyId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'category', action: 'read' })
  @ApiOperation({ summary: 'List product categories' })
  findAll(@TenantCompanyId() companyId: string, @Query() query: PaginationQueryDto) {
    return this.categoriesService.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'category', action: 'read' })
  @ApiOperation({ summary: 'Get a category by id' })
  findOne(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'category', action: 'update' })
  @Audit('update', 'Category')
  @ApiOperation({ summary: 'Update a category' })
  update(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'category', action: 'delete' })
  @Audit('delete', 'Category')
  @ApiOperation({ summary: 'Delete a category' })
  remove(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(companyId, id);
  }
}
