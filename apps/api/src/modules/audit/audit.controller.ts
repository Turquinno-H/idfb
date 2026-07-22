import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.interface';

@ApiTags('audit-logs')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions({ resource: 'audit_log', action: 'read' })
  @ApiOperation({ summary: 'List audit log entries for the active company' })
  findAll(@TenantCompanyId() companyId: string, @Query() query: PaginationQueryDto) {
    return this.auditService.findAll(companyId, query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Debug helper returning the resolved tenant/user' })
  whoami(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }
}
