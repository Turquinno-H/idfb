import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaService) {}

  /** Flattens all roles assigned to a company member into a deduplicated `resource:action` permission set. */
  async getPermissionsForMember(companyMemberId: string): Promise<string[]> {
    const memberRoles = await this.prisma.memberRole.findMany({
      where: { companyMemberId },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
      },
    });

    const permissions = new Set<string>();
    for (const memberRole of memberRoles) {
      for (const rolePermission of memberRole.role.rolePermissions) {
        permissions.add(
          `${rolePermission.permission.resource}:${rolePermission.permission.action}`,
        );
      }
    }
    return Array.from(permissions);
  }
}
