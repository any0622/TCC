import { Injectable } from '@nestjs/common';
import type { PrismaService } from '../../../../infra/prisma/prisma.service';
import { PatientRepositoryPort } from '../../application/ports';
import { PatientProfile } from '../../domain/entities/patient-profile.entity';

@Injectable()
export class PrismaPatientRepository implements PatientRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PatientProfile | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async save(profile: PatientProfile): Promise<PatientProfile> {
    const data = profile.toPersistence();
    const saved = await this.prisma.user.update({
      where: { id: data.id },
      data: {
        fullName: data.fullName,
        cpf: data.cpf,
        phone: data.phone,
        address: data.address,
        birthDate: data.birthDate,
        bloodType: data.bloodType,
        weightKg: data.weightKg,
        heightCm: data.heightCm,
      },
    });
    return this.toDomain(saved);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  private toDomain(prismaUser: any): PatientProfile {
    return PatientProfile.reconstruct({
      id: prismaUser.id,
      fullName: prismaUser.fullName,
      email: prismaUser.email,
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