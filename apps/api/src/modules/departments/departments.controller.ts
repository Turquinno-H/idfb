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
import { DepartmentsService } from './departments.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from './dto/departments.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('departments')
@ApiBearerAuth()
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

  @Post()
  @RequirePermissions({ resource: 'employee', action: 'create' })
  @Audit('create', 'Department')
  @ApiOperation({ summary: 'Create Department' })
  create(
    @TenantCompanyId() companyId: string,
    @Body() dto: CreateDepartmentDto,
  ) {
    return this.service.create(companyId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'employee', action: 'read' })
  @ApiOperation({ summary: 'List Department records' })
  findAll(
    @TenantCompanyId() companyId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'employee', action: 'read' })
  @ApiOperation({ summary: 'Get Department by id' })
  findOne(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'employee', action: 'update' })
  @Audit('update', 'Department')
  @ApiOperation({ summary: 'Update Department' })
  update(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.service.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'employee', action: 'delete' })
  @Audit('delete', 'Department')
  @ApiOperation({ summary: 'Delete Department' })
  remove(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(companyId, id);
  }
}
