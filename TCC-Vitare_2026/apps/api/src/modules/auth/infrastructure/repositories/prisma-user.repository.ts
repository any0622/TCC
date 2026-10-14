import { Injectable } from '@nestjs/common';
import type { PrismaService } from '../../../../infra/prisma/prisma.service';
import { UserRepositoryPort } from '../../application/ports';
import { User } from '../../domain/entities/user.entity';
import { Email, CPF } from '../../domain/value-objects';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { googleId } });
    return user ? this.toDomain(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async findByCPF(cpf: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { cpf } });
    return user ? this.toDomain(user) : null;
  }

  async save(user: User): Promise<User> {
    const data = user.toPersistence();
    const saved = await this.prisma.user.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
    return this.toDomain(saved);
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  private toDomain(prismaUser: any): User {
    return User.reconstruct({
      id: prismaUser.id,
      fullName: prismaUser.fullName,
      email: prismaUser.email,
      passwordHash: prismaUser.passwordHash,
      googleId: prismaUser.googleId,
      avatarUrl: prismaUser.avatarUrl,
      cpf: prismaUser.cpf,
      phone: prismaUser.phone,
      address: prismaUser.address,
      birthDate: prismaUser.birthDate,
      bloodType: prismaUser.bloodType,
      weightKg: prismaUser.weightKg ? Number(prismaUser.weightKg) : null,
      heightCm: prismaUser.heightCm,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}