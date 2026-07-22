import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { UsersService } from './users.service';
import {
  AssignRolesDto,
  CreateRoleDto,
  InviteUserDto,
  UpdateRoleDto,
} from './dto/roles.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('roles-and-users')
@ApiBearerAuth()
@Controller()
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService,
  ) {}

  // Permissions catalog
  @Get('permissions')
  @RequirePermissions({ resource: 'role', action: 'read' })
  @ApiOperation({ summary: 'List all assignable permissions' })
  listPermissions() {
    return this.rolesService.listPermissions();
  }

  // Roles
  @Post('roles')
  @RequirePermissions({ resource: 'role', action: 'create' })
  @Audit('create', 'Role')
  @ApiOperation({ summary: 'Create a role with permissions' })
  createRole(@TenantCompanyId() companyId: string, @Body() dto: CreateRoleDto) {
    return this.rolesService.create(companyId, dto);
  }

  @Get('roles')
  @RequirePermissions({ resource: 'role', action: 'read' })
  @ApiOperation({ summary: 'List roles' })
  listRoles(@TenantCompanyId() companyId: string) {
    return this.rolesService.findAll(companyId);
  }

  @Get('roles/:id')
  @RequirePermissions({ resource: 'role', action: 'read' })
  @ApiOperation({ summary: 'Get a role by id' })
  getRole(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.rolesService.findOne(companyId, id);
  }

  @Patch('roles/:id')
  @RequirePermissions({ resource: 'role', action: 'update' })
  @Audit('update', 'Role')
  @ApiOperation({ summary: 'Update a role' })
  updateRole(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rolesService.update(companyId, id, dto);
  }

  @Delete('roles/:id')
  @RequirePermissions({ resource: 'role', action: 'delete' })
  @Audit('delete', 'Role')
  @ApiOperation({ summary: 'Delete a role' })
  removeRole(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.rolesService.remove(companyId, id);
  }

  // Members
  @Get('members')
  @RequirePermissions({ resource: 'user', action: 'read' })
  @ApiOperation({ summary: 'List company members' })
  listMembers(@TenantCompanyId() companyId: string) {
    return this.usersService.listMembers(companyId);
  }

  @Post('members/invite')
  @RequirePermissions({ resource: 'user', action: 'create' })
  @Audit('invite', 'CompanyMember')
  @ApiOperation({ summary: 'Invite a user to the company' })
  invite(@TenantCompanyId() companyId: string, @Body() dto: InviteUserDto) {
    return this.usersService.invite(companyId, dto);
  }

  @Patch('members/:id/roles')
  @RequirePermissions({ resource: 'user', action: 'update' })
  @Audit('assign-roles', 'CompanyMember')
  @ApiOperation({ summary: 'Replace the roles assigned to a member' })
  assignRoles(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignRolesDto,
  ) {
    return this.usersService.assignRoles(companyId, id, dto);
  }

  @Post('members/:id/suspend')
  @RequirePermissions({ resource: 'user', action: 'update' })
  @Audit('suspend', 'CompanyMember')
  @ApiOperation({ summary: 'Suspend a company member' })
  suspend(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.setStatus(companyId, id, 'SUSPENDED');
  }

  @Post('members/:id/activate')
  @RequirePermissions({ resource: 'user', action: 'update' })
  @Audit('activate', 'CompanyMember')
  @ApiOperation({ summary: 'Reactivate a company member' })
  activate(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.setStatus(companyId, id, 'ACTIVE');
  }
}
