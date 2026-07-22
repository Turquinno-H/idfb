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
import { PaymentMethodsService } from './payment-methods.service';
import {
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
} from './dto/payment-methods.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('payment-methods')
@ApiBearerAuth()
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly service: PaymentMethodsService) {}

  @Post()
  @RequirePermissions({ resource: 'collection', action: 'create' })
  @Audit('create', 'PaymentMethod')
  @ApiOperation({ summary: 'Create PaymentMethod' })
  create(
    @TenantCompanyId() companyId: string,
    @Body() dto: CreatePaymentMethodDto,
  ) {
    return this.service.create(companyId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'collection', action: 'read' })
  @ApiOperation({ summary: 'List PaymentMethod records' })
  findAll(
    @TenantCompanyId() companyId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'collection', action: 'read' })
  @ApiOperation({ summary: 'Get PaymentMethod by id' })
  findOne(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'collection', action: 'update' })
  @Audit('update', 'PaymentMethod')
  @ApiOperation({ summary: 'Update PaymentMethod' })
  update(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentMethodDto,
  ) {
    return this.service.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'collection', action: 'delete' })
  @Audit('delete', 'PaymentMethod')
  @ApiOperation({ summary: 'Delete PaymentMethod' })
  remove(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(companyId, id);
  }
}
