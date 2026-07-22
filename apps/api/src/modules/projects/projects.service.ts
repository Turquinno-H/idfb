import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TaskStatus } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PaginationQueryDto,
  paginate,
  PaginatedResult,
} from '../../common/dto/pagination.dto';
import {
  CreateProjectDto,
  CreateTaskDto,
  UpdateProjectDto,
  UpdateTaskDto,
} from './dto/projects.dto';

type ProjectEntity = Prisma.ProjectGetPayload<{ include: { customer: true } }>;
type TaskEntity = Prisma.TaskGetPayload<{ include: { project: true } }>;

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- Projects ----

  async createProject(
    companyId: string,
    dto: CreateProjectDto,
  ): Promise<ProjectEntity> {
    return this.prisma.project.create({
      data: {
        companyId,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        status: dto.status,
        customerId: dto.customerId,
        branchId: dto.branchId,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        budget: dto.budget,
      },
      include: { customer: true },
    });
  }

  async listProjects(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<ProjectEntity>> {
    const where: Prisma.ProjectWhereInput = {
      companyId,
      ...(query.search
        ? { name: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.project.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async getProject(companyId: string, id: string): Promise<ProjectEntity> {
    const project = await this.prisma.project.findFirst({
      where: { id, companyId },
      include: { customer: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async updateProject(
    companyId: string,
    id: string,
    dto: UpdateProjectDto,
  ): Promise<ProjectEntity> {
    await this.getProject(companyId, id);
    return this.prisma.project.update({
      where: { id },
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        status: dto.status,
        customerId: dto.customerId,
        branchId: dto.branchId,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        budget: dto.budget,
      },
      include: { customer: true },
    });
  }

  async removeProject(companyId: string, id: string): Promise<ProjectEntity> {
    await this.getProject(companyId, id);
    return this.prisma.project.delete({
      where: { id },
      include: { customer: true },
    });
  }

  // ---- Tasks ----

  async createTask(companyId: string, dto: CreateTaskDto): Promise<TaskEntity> {
    if (dto.projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: dto.projectId, companyId },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }
    return this.prisma.task.create({
      data: {
        companyId,
        title: dto.title,
        description: dto.description,
        projectId: dto.projectId,
        assigneeUserId: dto.assigneeUserId,
        status: dto.status,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: { project: true },
    });
  }

  async listTasks(
    companyId: string,
    query: PaginationQueryDto,
    projectId?: string,
  ): Promise<PaginatedResult<TaskEntity>> {
    const where: Prisma.TaskWhereInput = {
      companyId,
      ...(projectId ? { projectId } : {}),
      ...(query.search
        ? { title: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        include: { project: true },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.task.count({ where }),
    ]);
    return paginate(data, total, query.page, query.limit);
  }

  async updateTask(
    companyId: string,
    id: string,
    dto: UpdateTaskDto,
  ): Promise<TaskEntity> {
    const task = await this.prisma.task.findFirst({ where: { id, companyId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    const completedAt =
      dto.status === TaskStatus.DONE && task.status !== TaskStatus.DONE
        ? new Date()
        : undefined;
    return this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        projectId: dto.projectId,
        assigneeUserId: dto.assigneeUserId,
        status: dto.status,
        priority: dto.priority,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        completedAt,
      },
      include: { project: true },
    });
  }

  async removeTask(companyId: string, id: string): Promise<TaskEntity> {
    const task = await this.prisma.task.findFirst({ where: { id, companyId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return this.prisma.task.delete({
      where: { id },
      include: { project: true },
    });
  }
}
