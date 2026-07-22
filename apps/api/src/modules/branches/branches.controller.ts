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
import { BranchesService } from './branches.service';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('branches')
@ApiBearerAuth()
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @RequirePermissions({ resource: 'branch', action: 'create' })
  @Audit('create', 'Branch')
  @ApiOperation({ summary: 'Create a branch' })
  create(@TenantCompanyId() companyId: string, @Body() dto: CreateBranchDto) {
    return this.branchesService.create(companyId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'branch', action: 'read' })
  @ApiOperation({ summary: 'List branches' })
  findAll(
    @TenantCompanyId() companyId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.branchesService.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'branch', action: 'read' })
  @ApiOperation({ summary: 'Get a branch by id' })
  findOne(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.branchesService.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'branch', action: 'update' })
  @Audit('update', 'Branch')
  @ApiOperation({ summary: 'Update a branch' })
  update(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.branchesService.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'branch', action: 'delete' })
  @Audit('delete', 'Branch')
  @ApiOperation({ summary: 'Delete a branch' })
  remove(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.branchesService.remove(companyId, id);
  }
}
