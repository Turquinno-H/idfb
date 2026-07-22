import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Aggregate KPI summary for the active company' })
  summary(@TenantCompanyId() companyId: string) {
    return this.service.getSummary(companyId);
  }

  @Get('sales-trend')
  @ApiQuery({ name: 'months', required: false, type: Number })
  @ApiOperation({
    summary: 'Monthly sales invoice totals for the last N months',
  })
  salesTrend(
    @TenantCompanyId() companyId: string,
    @Query('months', new DefaultValuePipe(6), ParseIntPipe) months: number,
  ) {
    return this.service.getSalesTrend(
      companyId,
      Math.min(Math.max(months, 1), 24),
    );
  }
}
