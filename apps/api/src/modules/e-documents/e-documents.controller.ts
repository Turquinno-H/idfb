import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EDocumentsService } from './e-documents.service';
import { IssueEInvoiceDto, IssueEWaybillDto } from './dto/e-documents.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('e-documents')
@ApiBearerAuth()
@Controller('e-documents')
export class EDocumentsController {
  constructor(private readonly service: EDocumentsService) {}

  @Post('e-invoices')
  @RequirePermissions({ resource: 'sales_invoice', action: 'approve' })
  @Audit('issue', 'EInvoice')
  @ApiOperation({
    summary: 'Issue an e-Invoice / e-Archive document for a sales invoice',
  })
  issueEInvoice(
    @TenantCompanyId() companyId: string,
    @Body() dto: IssueEInvoiceDto,
  ) {
    return this.service.issueEInvoice(companyId, dto);
  }

  @Get('e-invoices')
  @RequirePermissions({ resource: 'sales_invoice', action: 'read' })
  @ApiOperation({ summary: 'List e-Invoice documents' })
  listEInvoices(
    @TenantCompanyId() companyId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.listEInvoices(companyId, query);
  }

  @Get('e-invoices/:id')
  @RequirePermissions({ resource: 'sales_invoice', action: 'read' })
  @ApiOperation({ summary: 'Get an e-Invoice document by id' })
  getEInvoice(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.getEInvoice(companyId, id);
  }

  @Post('e-invoices/:id/cancel')
  @RequirePermissions({ resource: 'sales_invoice', action: 'update' })
  @Audit('cancel', 'EInvoice')
  @ApiOperation({ summary: 'Cancel a queued/sent e-Invoice document' })
  cancelEInvoice(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.cancelEInvoice(companyId, id);
  }

  @Post('e-waybills')
  @RequirePermissions({ resource: 'waybill', action: 'approve' })
  @Audit('issue', 'EWaybill')
  @ApiOperation({
    summary: 'Issue an e-Waybill document for an outbound waybill',
  })
  issueEWaybill(
    @TenantCompanyId() companyId: string,
    @Body() dto: IssueEWaybillDto,
  ) {
    return this.service.issueEWaybill(companyId, dto);
  }

  @Get('e-waybills')
  @RequirePermissions({ resource: 'waybill', action: 'read' })
  @ApiOperation({ summary: 'List e-Waybill documents' })
  listEWaybills(
    @TenantCompanyId() companyId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.listEWaybills(companyId, query);
  }
}
