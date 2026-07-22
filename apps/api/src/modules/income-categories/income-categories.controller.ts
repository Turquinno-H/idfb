import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IncomeCategoriesService } from './income-categories.service';
import { CreateIncomeCategoryDto, UpdateIncomeCategoryDto } from './dto/income-categories.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('income-categories')
@ApiBearerAuth()
@Controller('income-categories')
export class IncomeCategoriesController {
  constructor(private readonly service: IncomeCategoriesService) {}

  @Post()
  @RequirePermissions({ resource: 'income', action: 'create' })
  @Audit('create', 'IncomeCategory')
  @ApiOperation({ summary: 'Create IncomeCategory' })
  create(@TenantCompanyId() companyId: string, @Body() dto: CreateIncomeCategoryDto) {
    return this.service.create(companyId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'income', action: 'read' })
  @ApiOperation({ summary: 'List IncomeCategory records' })
  findAll(@TenantCompanyId() companyId: string, @Query() query: PaginationQueryDto) {
    return this.service.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'income', action: 'read' })
  @ApiOperation({ summary: 'Get IncomeCategory by id' })
  findOne(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'income', action: 'update' })
  @Audit('update', 'IncomeCategory')
  @ApiOperation({ summary: 'Update IncomeCategory' })
  update(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIncomeCategoryDto,
  ) {
    return this.service.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'income', action: 'delete' })
  @Audit('delete', 'IncomeCategory')
  @ApiOperation({ summary: 'Delete IncomeCategory' })
  remove(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(companyId, id);
  }
}
