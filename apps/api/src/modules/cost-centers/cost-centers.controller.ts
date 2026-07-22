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
import { CostCentersService } from './cost-centers.service';
import {
  CreateCostCenterDto,
  UpdateCostCenterDto,
} from './dto/cost-centers.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('cost-centers')
@ApiBearerAuth()
@Controller('cost-centers')
export class CostCentersController {
  constructor(private readonly service: CostCentersService) {}

  @Post()
  @RequirePermissions({ resource: 'cost_center', action: 'create' })
  @Audit('create', 'CostCenter')
  @ApiOperation({ summary: 'Create CostCenter' })
  create(
    @TenantCompanyId() companyId: string,
    @Body() dto: CreateCostCenterDto,
  ) {
    return this.service.create(companyId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'cost_center', action: 'read' })
  @ApiOperation({ summary: 'List CostCenter records' })
  findAll(
    @TenantCompanyId() companyId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'cost_center', action: 'read' })
  @ApiOperation({ summary: 'Get CostCenter by id' })
  findOne(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'cost_center', action: 'update' })
  @Audit('update', 'CostCenter')
  @ApiOperation({ summary: 'Update CostCenter' })
  update(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCostCenterDto,
  ) {
    return this.service.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'cost_center', action: 'delete' })
  @Audit('delete', 'CostCenter')
  @ApiOperation({ summary: 'Delete CostCenter' })
  remove(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(companyId, id);
  }
}
