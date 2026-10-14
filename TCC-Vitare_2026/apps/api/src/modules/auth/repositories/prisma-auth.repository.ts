import { Injectable } from '@nestjs/common';
import { User } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import { AuthRepository } from './auth.repository';

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  createLocalUser(data: {
    fullName: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    return this.prisma.user.create({ data });
  }

  createGoogleUser(data: {
    fullName: string;
    email: string;
    googleId: string;
    avatarUrl?: string;
  }): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async storeRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.prisma.refreshToken.create({ data });
  }

  findRefreshToken(tokenHash: string) {
    return this.prisma.refreshToken.findFirst({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, revokedAt: true },
    });
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async createPasswordResetToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.prisma.passwordResetToken.create({ data });
  }

  findPasswordResetToken(tokenHash: string) {
    return this.prisma.passwordResetToken.findFirst({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });
  }

  async markPasswordResetTokenUsed(tokenHash: string): Promise<void> {
    await this.prisma.passwordResetToken.updateMany({
      where: { tokenHash },
      data: { usedAt: new Date() },
    });
  }
}
