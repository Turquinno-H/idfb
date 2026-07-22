import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { AppConfig } from '../config/configuration';
import type { AccessTokenPayload } from './types/authenticated-user.interface';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface IssueRefreshTokenParams {
  userId: string;
  family?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private get jwtConfig(): AppConfig['jwt'] {
    return this.configService.get<AppConfig['jwt']>('app.jwt')!;
  }

  signAccessToken(payload: AccessTokenPayload): { token: string; expiresIn: number } {
    const expiresIn = this.jwtConfig.accessExpiresIn;
    const token = this.jwtService.sign(payload, {
      secret: this.jwtConfig.accessSecret,
      expiresIn,
    });
    return { token, expiresIn: this.parseExpiresInSeconds(expiresIn) };
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return this.jwtService.verify<AccessTokenPayload>(token, {
      secret: this.jwtConfig.accessSecret,
    });
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  async issueRefreshToken(params: IssueRefreshTokenParams): Promise<string> {
    const rawToken = randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.jwtConfig.refreshExpiresInDays);

    await this.prisma.refreshToken.create({
      data: {
        userId: params.userId,
        tokenHash: this.hashToken(rawToken),
        family: params.family ?? randomUUID(),
        expiresAt,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });

    return rawToken;
  }

  /**
   * Validates a presented refresh token and rotates it: the old token is marked
   * revoked/replaced and a brand-new token in the same rotation family is issued.
   * Re-presenting an already-rotated token revokes the entire family (theft detection).
   */
  async rotateRefreshToken(
    rawToken: string,
    context: { ipAddress?: string; userAgent?: string },
  ): Promise<{ userId: string; refreshToken: string }> {
    const tokenHash = this.hashToken(rawToken);
    const existing = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!existing) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (existing.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { family: existing.family, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token reuse detected, session revoked');
    }

    if (existing.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const newRawToken = randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.jwtConfig.refreshExpiresInDays);

    const newToken = await this.prisma.refreshToken.create({
      data: {
        userId: existing.userId,
        tokenHash: this.hashToken(newRawToken),
        family: existing.family,
        expiresAt,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      },
    });

    await this.prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date(), replacedByTokenId: newToken.id },
    });

    return { userId: existing.userId, refreshToken: newRawToken };
  }

  async revokeRefreshToken(rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private parseExpiresInSeconds(expiresIn: string): number {
    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    if (!match) {
      return 900;
    }
    const value = parseInt(match[1], 10);
    const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[match[2] as 's' | 'm' | 'h' | 'd'];
    return value * multiplier;
  }
}
