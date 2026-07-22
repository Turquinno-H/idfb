import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/roles.dto';

type RoleEntity = Prisma.RoleGetPayload<{
  include: { rolePermissions: { include: { permission: true } } };
}>;

const ROLE_INCLUDE = {
  rolePermissions: { include: { permission: true } },
} satisfies Prisma.RoleInclude;

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async listPermissions(): Promise<Prisma.PermissionGetPayload<Record<string, never>>[]> {
    return this.prisma.permission.findMany({ orderBy: [{ resource: 'asc' }, { action: 'asc' }] });
  }

  async create(companyId: string, dto: CreateRoleDto): Promise<RoleEntity> {
    await this.assertPermissionsExist(dto.permissionIds);
    return this.prisma.role.create({
      data: {
        companyId,
        name: dto.name,
        description: dto.description,
        rolePermissions: {
          create: dto.permissionIds.map((permissionId) => ({ permissionId })),
        },
      },
      include: ROLE_INCLUDE,
    });
  }

  async findAll(companyId: string): Promise<RoleEntity[]> {
    return this.prisma.role.findMany({
      where: { companyId },
      include: ROLE_INCLUDE,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(companyId: string, id: string): Promise<RoleEntity> {
    const role = await this.prisma.role.findFirst({ where: { id, companyId }, include: ROLE_INCLUDE });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async update(companyId: string, id: string, dto: UpdateRoleDto): Promise<RoleEntity> {
    const role = await this.findOne(companyId, id);
    if (role.isSystem && dto.permissionIds) {
      throw new BadRequestException('System role permissions cannot be modified');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.permissionIds) {
        await this.assertPermissionsExist(dto.permissionIds);
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        await tx.rolePermission.createMany({
          data: dto.permissionIds.map((permissionId) => ({ roleId: id, permissionId })),
        });
      }
      await tx.role.update({
        where: { id },
        data: { name: dto.name, description: dto.description },
      });
      return tx.role.findFirstOrThrow({ where: { id }, include: ROLE_INCLUDE });
    });
  }

  async remove(companyId: string, id: string): Promise<RoleEntity> {
    const role = await this.findOne(companyId, id);
    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be deleted');
    }
    return this.prisma.role.delete({ where: { id }, include: ROLE_INCLUDE });
  }

  private async assertPermissionsExist(permissionIds: string[]): Promise<void> {
    if (permissionIds.length === 0) {
      return;
    }
    const count = await this.prisma.permission.count({ where: { id: { in: permissionIds } } });
    if (count !== new Set(permissionIds).size) {
      throw new BadRequestException('One or more permission ids are invalid');
    }
  }
}
