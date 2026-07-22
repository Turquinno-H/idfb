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
import { BanksService } from './banks.service';
import { CreateBankDto, UpdateBankDto } from './dto/banks.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('banks')
@ApiBearerAuth()
@Controller('banks')
export class BanksController {
  constructor(private readonly service: BanksService) {}

  @Post()
  @RequirePermissions({ resource: 'bank_account', action: 'create' })
  @Audit('create', 'Bank')
  @ApiOperation({ summary: 'Create Bank' })
  create(@TenantCompanyId() companyId: string, @Body() dto: CreateBankDto) {
    return this.service.create(companyId, dto);
  }

  @Get()
  @RequirePermissions({ resource: 'bank_account', action: 'read' })
  @ApiOperation({ summary: 'List Bank records' })
  findAll(
    @TenantCompanyId() companyId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'bank_account', action: 'read' })
  @ApiOperation({ summary: 'Get Bank by id' })
  findOne(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'bank_account', action: 'update' })
  @Audit('update', 'Bank')
  @ApiOperation({ summary: 'Update Bank' })
  update(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBankDto,
  ) {
    return this.service.update(companyId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'bank_account', action: 'delete' })
  @Audit('delete', 'Bank')
  @ApiOperation({ summary: 'Delete Bank' })
  remove(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(companyId, id);
  }
}
