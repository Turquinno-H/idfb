import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { AssignRolesDto, InviteUserDto } from './dto/roles.dto';

type MemberEntity = Prisma.CompanyMemberGetPayload<{
  include: { user: true; memberRoles: { include: { role: true } } };
}>;

const MEMBER_INCLUDE = {
  user: true,
  memberRoles: { include: { role: true } },
} satisfies Prisma.CompanyMemberInclude;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async listMembers(companyId: string): Promise<MemberEntity[]> {
    return this.prisma.companyMember.findMany({
      where: { companyId },
      include: MEMBER_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Invites a user to the company. If the user does not yet exist, a user
   * record is created with a random temporary password that must be reset. The
   * requested roles are validated against the company and assigned.
   */
  async invite(companyId: string, dto: InviteUserDto): Promise<MemberEntity> {
    const roles = await this.prisma.role.findMany({
      where: { companyId, id: { in: dto.roleIds } },
    });
    if (roles.length !== new Set(dto.roleIds).size) {
      throw new BadRequestException('One or more role ids are invalid for this company');
    }

    const temporaryPassword = randomBytes(12).toString('base64url');

    const member = await this.prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({ where: { email: dto.email } });
      if (!user) {
        user = await tx.user.create({
          data: {
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
            passwordHash: await argon2.hash(temporaryPassword),
          },
        });
      }

      const existingMember = await tx.companyMember.findUnique({
        where: { companyId_userId: { companyId, userId: user.id } },
      });
      if (existingMember) {
        throw new BadRequestException('User is already a member of this company');
      }

      const created = await tx.companyMember.create({
        data: {
          companyId,
          userId: user.id,
          status: 'ACTIVE',
          invitedAt: new Date(),
          joinedAt: new Date(),
          memberRoles: { create: dto.roleIds.map((roleId) => ({ roleId })) },
        },
        include: MEMBER_INCLUDE,
      });
      return created;
    });

    await this.mailService
      .send({
        to: dto.email,
        subject: 'IDFB ERP — Şirket Daveti',
        html: `<p>Merhaba ${dto.firstName},</p><p>Bir şirkete üye olarak eklendiniz. Geçici şifreniz: <strong>${temporaryPassword}</strong></p><p>İlk girişten sonra şifrenizi değiştirmeniz gerekmektedir.</p>`,
      })
      .catch(() => undefined);

    return member;
  }

  async assignRoles(companyId: string, memberId: string, dto: AssignRolesDto): Promise<MemberEntity> {
    const member = await this.prisma.companyMember.findFirst({
      where: { id: memberId, companyId },
    });
    if (!member) {
      throw new NotFoundException('Company member not found');
    }
    const roles = await this.prisma.role.findMany({
      where: { companyId, id: { in: dto.roleIds } },
    });
    if (roles.length !== new Set(dto.roleIds).size) {
      throw new BadRequestException('One or more role ids are invalid for this company');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.memberRole.deleteMany({ where: { companyMemberId: memberId } });
      await tx.memberRole.createMany({
        data: dto.roleIds.map((roleId) => ({ companyMemberId: memberId, roleId })),
      });
      return tx.companyMember.findFirstOrThrow({
        where: { id: memberId },
        include: MEMBER_INCLUDE,
      });
    });
  }

  async setStatus(
    companyId: string,
    memberId: string,
    status: 'ACTIVE' | 'SUSPENDED',
  ): Promise<MemberEntity> {
    const member = await this.prisma.companyMember.findFirst({
      where: { id: memberId, companyId },
    });
    if (!member) {
      throw new NotFoundException('Company member not found');
    }
    return this.prisma.companyMember.update({
      where: { id: memberId },
      data: { status },
      include: MEMBER_INCLUDE,
    });
  }
}
