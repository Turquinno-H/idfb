import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateCompanyProfileDto, UpsertSettingDto } from './dto/settings.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  @RequirePermissions({ resource: 'settings', action: 'read' })
  @ApiOperation({ summary: 'List company key/value settings' })
  list(@TenantCompanyId() companyId: string) {
    return this.service.listSettings(companyId);
  }

  @Post()
  @RequirePermissions({ resource: 'settings', action: 'update' })
  @Audit('upsert', 'CompanySetting')
  @ApiOperation({ summary: 'Create or update a company setting' })
  upsert(@TenantCompanyId() companyId: string, @Body() dto: UpsertSettingDto) {
    return this.service.upsertSetting(companyId, dto);
  }

  @Get('company')
  @RequirePermissions({ resource: 'settings', action: 'read' })
  @ApiOperation({ summary: 'Get the company profile' })
  getCompany(@TenantCompanyId() companyId: string) {
    return this.service.getCompanyProfile(companyId);
  }

  @Patch('company')
  @RequirePermissions({ resource: 'settings', action: 'update' })
  @Audit('update', 'Company')
  @ApiOperation({ summary: 'Update the company profile' })
  updateCompany(@TenantCompanyId() companyId: string, @Body() dto: UpdateCompanyProfileDto) {
    return this.service.updateCompanyProfile(companyId, dto);
  }

  @Get('currencies')
  @ApiOperation({ summary: 'List supported currencies' })
  listCurrencies() {
    return this.service.listCurrencies();
  }
}
