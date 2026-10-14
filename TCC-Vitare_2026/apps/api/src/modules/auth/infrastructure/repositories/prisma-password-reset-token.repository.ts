import { Injectable } from '@nestjs/common';
import type { PrismaService } from '../../../../infra/prisma/prisma.service';
import { PasswordResetTokenRepositoryPort } from '../../application/ports';

@Injectable()
export class PrismaPasswordResetTokenRepository implements PasswordResetTokenRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    await this.prisma.passwordResetToken.create({ data });
  }

  async findByTokenHash(tokenHash: string): Promise<{ id: string; userId: string; expiresAt: Date; usedAt: Date | null } | null> {
    return this.prisma.passwordResetToken.findFirst({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });
  }

  async markAsUsed(tokenHash: string): Promise<void> {
    await this.prisma.passwordResetToken.updateMany({
      where: { tokenHash },
      data: { usedAt: new Date() },
    });
  }
}