import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/finance.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.interface';

@ApiTags('collections')
@ApiBearerAuth()
@Controller('collections')
export class CollectionsController {
  constructor(private readonly service: CollectionsService) {}

  @Post()
  @RequirePermissions({ resource: 'collection', action: 'create' })
  @Audit('create', 'Collection')
  @ApiOperation({ summary: 'Record a customer collection (updates invoice balance)' })
  create(
    @TenantCompanyId() companyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCollectionDto,
  ) {
    return this.service.create(companyId, user.userId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'collection', action: 'read' })
  @ApiOperation({ summary: 'List collections' })
  findAll(@TenantCompanyId() companyId: string, @Query() query: PaginationQueryDto) {
    return this.service.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'collection', action: 'read' })
  @ApiOperation({ summary: 'Get a collection by id' })
  findOne(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(companyId, id);
  }
}
