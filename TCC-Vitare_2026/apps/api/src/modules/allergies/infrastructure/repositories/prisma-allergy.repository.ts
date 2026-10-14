import { Injectable } from '@nestjs/common';
import type { PrismaService } from '../../../../infra/prisma/prisma.service';
import { AllergyRepositoryPort } from '../../application/ports';
import { Allergy } from '../../domain/entities/allergy.entity';

@Injectable()
export class PrismaAllergyRepository implements AllergyRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string): Promise<Allergy[]> {
    const allergies = await this.prisma.allergy.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return allergies.map(this.toDomain);
  }

  async findById(id: string): Promise<Allergy | null> {
    const allergy = await this.prisma.allergy.findUnique({ where: { id } });
    return allergy ? this.toDomain(allergy) : null;
  }

  async save(allergy: Allergy): Promise<Allergy> {
    const data = allergy.toPersistence();
    const saved = await this.prisma.allergy.create({ data });
    return this.toDomain(saved);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.allergy.delete({ where: { id } });
  }

  private toDomain(prismaAllergy: any): Allergy {
    return Allergy.reconstruct({
      id: prismaAllergy.id,
      userId: prismaAllergy.userId,
      name: prismaAllergy.name,
      severity: prismaAllergy.severity,
      notes: prismaAllergy.notes,
      createdAt: prismaAllergy.createdAt,
    });
  }
}