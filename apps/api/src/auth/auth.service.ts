import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { RbacService } from '../rbac/rbac.service';
import { TokenService, TokenPair } from './token.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { AccessTokenPayload } from './types/authenticated-user.interface';

interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly rbacService: RbacService,
  ) {}

  async register(dto: RegisterDto, context: RequestContext): Promise<TokenPair> {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const existingCompany = await this.prisma.company.findUnique({
      where: { taxNumber: dto.taxNumber },
    });
    if (existingCompany) {
      throw new ConflictException('A company with this tax number already exists');
    }

    const baseCurrency = await this.prisma.currency.findUniqueOrThrow({ where: { code: 'TRY' } });
    const passwordHash = await argon2.hash(dto.password);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });

      const company = await tx.company.create({
        data: {
          name: dto.companyName,
          taxNumber: dto.taxNumber,
          baseCurrencyId: baseCurrency.id,
          subscriptionPlan: 'TRIAL',
          subscriptionStatus: 'TRIAL',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });

      const adminRole = await tx.role.create({
        data: { companyId: company.id, name: 'Admin', description: 'Şirket yöneticisi', isSystem: true },
      });

      const allPermissions = await tx.permission.findMany();
      await tx.rolePermission.createMany({
        data: allPermissions.map((permission) => ({ roleId: adminRole.id, permissionId: permission.id })),
      });

      const member = await tx.companyMember.create({
        data: { companyId: company.id, userId: user.id, status: 'ACTIVE', joinedAt: new Date() },
      });

      await tx.memberRole.create({ data: { companyMemberId: member.id, roleId: adminRole.id } });

      await tx.branch.create({
        data: { companyId: company.id, code: 'MERKEZ', name: 'Merkez Şube', isMain: true },
      });

      const warehouse = await tx.warehouse.create({
        data: { companyId: company.id, code: 'ANA-DEPO', name: 'Ana Depo', type: 'MAIN' },
      });
      void warehouse;

      return { user, company, member };
    });

    return this.issueTokensForMember(result.user.id, result.member.id, context);
  }

  async login(dto: LoginDto, context: RequestContext): Promise<TokenPair | { companies: { id: string; name: string }[] }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        companyMembers: {
          where: { status: 'ACTIVE' },
          include: { company: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.companyMembers.length === 0 && !user.isSuperAdmin) {
      throw new ForbiddenException('This account is not linked to any active company');
    }

    let member = user.companyMembers[0];
    if (dto.companyId) {
      const requested = user.companyMembers.find((m) => m.companyId === dto.companyId);
      if (!requested) {
        throw new ForbiddenException('You are not a member of the requested company');
      }
      member = requested;
    } else if (user.companyMembers.length > 1) {
      return {
        companies: user.companyMembers.map((m) => ({ id: m.companyId, name: m.company.name })),
      };
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    return this.issueTokensForMember(user.id, member?.id ?? null, context, user.isSuperAdmin);
  }

  async refresh(rawRefreshToken: string, context: RequestContext): Promise<TokenPair> {
    const { userId, refreshToken } = await this.tokenService.rotateRefreshToken(rawRefreshToken, context);

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const activeMember = await this.prisma.companyMember.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { joinedAt: 'asc' },
    });

    const permissions = activeMember
      ? await this.rbacService.getPermissionsForMember(activeMember.id)
      : [];

    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      companyId: activeMember?.companyId ?? null,
      companyMemberId: activeMember?.id ?? null,
      permissions,
      isSuperAdmin: user.isSuperAdmin,
    };

    const { token, expiresIn } = this.tokenService.signAccessToken(payload);

    return { accessToken: token, refreshToken, expiresIn };
  }

  async switchCompany(userId: string, companyId: string, context: RequestContext): Promise<TokenPair> {
    const member = await this.prisma.companyMember.findUnique({
      where: { companyId_userId: { companyId, userId } },
    });
    if (!member || member.status !== 'ACTIVE') {
      throw new ForbiddenException('You are not an active member of this company');
    }
    return this.issueTokensForMember(userId, member.id, context);
  }

  async logout(rawRefreshToken: string): Promise<void> {
    await this.tokenService.revokeRefreshToken(rawRefreshToken);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const valid = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const passwordHash = await argon2.hash(dto.newPassword);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    await this.tokenService.revokeAllForUser(userId);
  }

  private async issueTokensForMember(
    userId: string,
    companyMemberId: string | null,
    context: RequestContext,
    isSuperAdminOverride?: boolean,
  ): Promise<TokenPair> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const member = companyMemberId
      ? await this.prisma.companyMember.findUniqueOrThrow({ where: { id: companyMemberId } })
      : null;

    const permissions = member ? await this.rbacService.getPermissionsForMember(member.id) : [];

    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      companyId: member?.companyId ?? null,
      companyMemberId: member?.id ?? null,
      permissions,
      isSuperAdmin: isSuperAdminOverride ?? user.isSuperAdmin,
    };

    const { token, expiresIn } = this.tokenService.signAccessToken(payload);
    const refreshToken = await this.tokenService.issueRefreshToken({
      userId: user.id,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return { accessToken: token, refreshToken, expiresIn };
  }
}
