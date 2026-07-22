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
import { TaxRatesService } from './tax-rates.service';
import { CreateTaxRateDto, UpdateTaxRateDto } from './dto/tax-rates.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('tax-rates')
@ApiBearerAuth()
@Controller('tax-rates')
export class TaxRatesController {
  constructor(private readonly service: TaxRatesService) {}

  @Post()
  @RequirePermissions({ resource: 'tax_rate', action: 'create' })
  @Audit('create', 'TaxRate')
  @ApiOperation({ summary: 'Create TaxRate' })
  create(@TenantCompanyId() companyId: string, @Body() dto: CreateTaxRateDto) {
    return this.service.create(companyId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'tax_rate', action: 'read' })
  @ApiOperation({ summary: 'List TaxRate records' })
  findAll(
    @TenantCompanyId() companyId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'tax_rate', action: 'read' })
  @ApiOperation({ summary: 'Get TaxRate by id' })
  findOne(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'tax_rate', action: 'update' })
  @Audit('update', 'TaxRate')
  @ApiOperation({ summary: 'Update TaxRate' })
  update(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaxRateDto,
  ) {
    return this.service.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'tax_rate', action: 'delete' })
  @Audit('delete', 'TaxRate')
  @ApiOperation({ summary: 'Delete TaxRate' })
  remove(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(companyId, id);
  }
}
