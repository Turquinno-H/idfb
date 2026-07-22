import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  CreateTaskDto,
  UpdateProjectDto,
  UpdateTaskDto,
} from './dto/projects.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TenantCompanyId } from '../../common/decorators/tenant.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('projects')
@ApiBearerAuth()
@Controller()
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  // Projects
  @Post('projects')
  @RequirePermissions({ resource: 'project', action: 'create' })
  @Audit('create', 'Project')
  @ApiOperation({ summary: 'Create a project' })
  createProject(@TenantCompanyId() companyId: string, @Body() dto: CreateProjectDto) {
    return this.service.createProject(companyId, dto);
  }

  @Get('projects')
  @RequirePermissions({ resource: 'project', action: 'read' })
  @ApiOperation({ summary: 'List projects' })
  listProjects(@TenantCompanyId() companyId: string, @Query() query: PaginationQueryDto) {
    return this.service.listProjects(companyId, query);
  }

  @Get('projects/:id')
  @RequirePermissions({ resource: 'project', action: 'read' })
  @ApiOperation({ summary: 'Get a project by id' })
  getProject(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.getProject(companyId, id);
  }

  @Patch('projects/:id')
  @RequirePermissions({ resource: 'project', action: 'update' })
  @Audit('update', 'Project')
  @ApiOperation({ summary: 'Update a project' })
  updateProject(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.service.updateProject(companyId, id, dto);
  }

  @Delete('projects/:id')
  @RequirePermissions({ resource: 'project', action: 'delete' })
  @Audit('delete', 'Project')
  @ApiOperation({ summary: 'Delete a project' })
  removeProject(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.removeProject(companyId, id);
  }

  // Tasks
  @Post('tasks')
  @RequirePermissions({ resource: 'task', action: 'create' })
  @Audit('create', 'Task')
  @ApiOperation({ summary: 'Create a task' })
  createTask(@TenantCompanyId() companyId: string, @Body() dto: CreateTaskDto) {
    return this.service.createTask(companyId, dto);
  }

  @Get('tasks')
  @RequirePermissions({ resource: 'task', action: 'read' })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiOperation({ summary: 'List tasks (optionally by project)' })
  listTasks(
    @TenantCompanyId() companyId: string,
    @Query() query: PaginationQueryDto,
    @Query('projectId') projectId?: string,
  ) {
    return this.service.listTasks(companyId, query, projectId);
  }

  @Patch('tasks/:id')
  @RequirePermissions({ resource: 'task', action: 'update' })
  @Audit('update', 'Task')
  @ApiOperation({ summary: 'Update a task' })
  updateTask(
    @TenantCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.service.updateTask(companyId, id, dto);
  }

  @Delete('tasks/:id')
  @RequirePermissions({ resource: 'task', action: 'delete' })
  @Audit('delete', 'Task')
  @ApiOperation({ summary: 'Delete a task' })
  removeTask(@TenantCompanyId() companyId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.removeTask(companyId, id);
  }
}
