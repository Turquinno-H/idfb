import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PosService } from './pos.service';
import {
  CreatePosSaleDto,
  CreatePosTerminalDto,
  UpdatePosTerminalDto,
} from './dto/pos.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.interface';

@ApiTags('pos')
@ApiBearerAuth()
@Controller('pos')
export class PosController {
  constructor(private readonly service: PosService) {}

  @Post('terminals')
  @RequirePermissions({ resource: 'pos_transaction', action: 'create' })
  @Audit('create', 'POSTerminal')
  @ApiOperation({ summary: 'Create a POS terminal' })
  createTerminal(
    @TenantCompanyId() companyId: string,
    @Body() dto: CreatePosTerminalDto,
  ) {
    return this.service.createTerminal(companyId, dto);
  }

  @Get('terminals')
  @RequirePermissions({ resource: 'pos_transaction', action: 'read' })
  @ApiOperation({ summary: 'List POS terminals' })
  listTerminals(@TenantCompanyId() companyId: string) {
    return this.service.listTerminals(companyId);
  }

  @Patch('terminals/:id')
  @RequirePermissions({ resource: 'pos_transaction', action: 'update' })
  @Audit('update', 'POSTerminal')
  @ApiOperation({ summary: 'Update a POS terminal' })
  updateTerminal(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePosTerminalDto,
  ) {
    return this.service.updateTerminal(companyId, id, dto);
  }

  @Post('sales')
  @RequirePermissions({ resource: 'pos_transaction', action: 'create' })
  @Audit('sale', 'POSTransaction')
  @ApiOperation({ summary: 'Process a POS sale (stock-out + payments)' })
  createSale(
    @TenantCompanyId() companyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePosSaleDto,
  ) {
    return this.service.createSale(companyId, user.userId, dto);
  }

  @Get('transactions')
  @RequirePermissions({ resource: 'pos_transaction', action: 'read' })
  @ApiOperation({ summary: 'List POS transactions' })
  listTransactions(
    @TenantCompanyId() companyId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.listTransactions(companyId, query);
  }

  @Get('transactions/:id')
  @RequirePermissions({ resource: 'pos_transaction', action: 'read' })
  @ApiOperation({ summary: 'Get a POS transaction by id' })
  getTransaction(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.getTransaction(companyId, id);
  }
}
