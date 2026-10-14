import { Injectable } from '@nestjs/common';
import type { PrismaService } from '../../../../infra/prisma/prisma.service';
import { RefreshTokenRepositoryPort } from '../../application/ports';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async store(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    await this.prisma.refreshToken.create({ data });
  }

  async findByTokenHash(tokenHash: string): Promise<{ id: string; userId: string; expiresAt: Date; revokedAt: Date | null } | null> {
    return this.prisma.refreshToken.findFirst({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, revokedAt: true },
    });
  }

  async revokeByTokenHash(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}