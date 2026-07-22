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
import { JobPositionsService } from './job-positions.service';
import {
  CreateJobPositionDto,
  UpdateJobPositionDto,
} from './dto/job-positions.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('job-positions')
@ApiBearerAuth()
@Controller('job-positions')
export class JobPositionsController {
  constructor(private readonly service: JobPositionsService) {}

  @Post()
  @RequirePermissions({ resource: 'employee', action: 'create' })
  @Audit('create', 'JobPosition')
  @ApiOperation({ summary: 'Create JobPosition' })
  create(
    @TenantCompanyId() companyId: string,
    @Body() dto: CreateJobPositionDto,
  ) {
    return this.service.create(companyId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'employee', action: 'read' })
  @ApiOperation({ summary: 'List JobPosition records' })
  findAll(
    @TenantCompanyId() companyId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'employee', action: 'read' })
  @ApiOperation({ summary: 'Get JobPosition by id' })
  findOne(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'employee', action: 'update' })
  @Audit('update', 'JobPosition')
  @ApiOperation({ summary: 'Update JobPosition' })
  update(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobPositionDto,
  ) {
    return this.service.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'employee', action: 'delete' })
  @Audit('delete', 'JobPosition')
  @ApiOperation({ summary: 'Delete JobPosition' })
  remove(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(companyId, id);
  }
}
