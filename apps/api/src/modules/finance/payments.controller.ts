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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/finance.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.interface';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  @RequirePermissions({ resource: 'payment', action: 'create' })
  @Audit('create', 'Payment')
  @ApiOperation({
    summary: 'Record a supplier payment (updates invoice balance)',
  })
  create(
    @TenantCompanyId() companyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.service.create(companyId, user.userId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'payment', action: 'read' })
  @ApiOperation({ summary: 'List payments' })
  findAll(
    @TenantCompanyId() companyId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'payment', action: 'read' })
  @ApiOperation({ summary: 'Get a payment by id' })
  findOne(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(companyId, id);
  }
}
