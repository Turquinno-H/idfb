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
import { QuotationStatus } from '@idfb/database';
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto, UpdateQuotationDto } from './dto/sales.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.interface';

@ApiTags('quotations')
@ApiBearerAuth()
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly service: QuotationsService) {}

  @Post()
  @RequirePermissions({ resource: 'quotation', action: 'create' })
  @Audit('create', 'Quotation')
  @ApiOperation({ summary: 'Create a quotation' })
  create(
    @TenantCompanyId() companyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateQuotationDto,
  ) {
    return this.service.create(companyId, user.userId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'quotation', action: 'read' })
  @ApiOperation({ summary: 'List quotations' })
  findAll(
    @TenantCompanyId() companyId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'quotation', action: 'read' })
  @ApiOperation({ summary: 'Get a quotation by id' })
  findOne(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'quotation', action: 'update' })
  @Audit('update', 'Quotation')
  @ApiOperation({ summary: 'Update a draft quotation' })
  update(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuotationDto,
  ) {
    return this.service.update(companyId, id, dto);
  }

  @Post(':id/send')
  @RequirePermissions({ resource: 'quotation', action: 'update' })
  @Audit('send', 'Quotation')
  @ApiOperation({ summary: 'Mark a quotation as sent' })
  send(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.setStatus(companyId, id, QuotationStatus.SENT);
  }

  @Post(':id/accept')
  @RequirePermissions({ resource: 'quotation', action: 'approve' })
  @Audit('accept', 'Quotation')
  @ApiOperation({ summary: 'Mark a quotation as accepted' })
  accept(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.setStatus(companyId, id, QuotationStatus.ACCEPTED);
  }

  @Post(':id/reject')
  @RequirePermissions({ resource: 'quotation', action: 'update' })
  @Audit('reject', 'Quotation')
  @ApiOperation({ summary: 'Mark a quotation as rejected' })
  reject(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.setStatus(companyId, id, QuotationStatus.REJECTED);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'quotation', action: 'delete' })
  @Audit('delete', 'Quotation')
  @ApiOperation({ summary: 'Delete a quotation' })
  remove(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(companyId, id);
  }
}
