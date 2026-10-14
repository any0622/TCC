import { Injectable } from '@nestjs/common';
import type { PrismaService } from '../../../../infra/prisma/prisma.service';
import { ForbiddenMedicationRepositoryPort } from '../../application/ports';
import { ForbiddenMedication, ForbiddenMedicationWithDetails } from '../../domain/repositories';

@Injectable()
export class PrismaForbiddenMedicationRepository implements ForbiddenMedicationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string): Promise<ForbiddenMedicationWithDetails[]> {
    const items = await this.prisma.forbiddenMedication.findMany({
      where: { userId },
      include: { medicationsDictionary: true },
      orderBy: { createdAt: 'desc' },
    });
    return items.map(this.toWithDetails);
  }

  async findById(id: string): Promise<ForbiddenMedicationWithDetails | null> {
    const item = await this.prisma.forbiddenMedication.findUnique({
      where: { id },
      include: { medicationsDictionary: true },
    });
    return item ? this.toWithDetails(item) : null;
  }

  async findByUserAndMedication(userId: string, medicationsDictionaryId: string): Promise<ForbiddenMedication | null> {
    const item = await this.prisma.forbiddenMedication.findUnique({
      where: { userId_medicationsDictionaryId: { userId, medicationsDictionaryId } },
    });
    return item ? this.toDomain(item) : null;
  }

  async save(forbidden: ForbiddenMedication): Promise<ForbiddenMedication> {
    const data = forbidden.toPersistence();
    const saved = await this.prisma.forbiddenMedication.create({ data });
    return this.toDomain(saved);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.forbiddenMedication.delete({ where: { id } });
  }

  private toDomain(prismaItem: any): ForbiddenMedication {
    return ForbiddenMedication.reconstruct({
      id: prismaItem.id,
      userId: prismaItem.userId,
      medicationsDictionaryId: prismaItem.medicationsDictionaryId,
      reason: prismaItem.reason,
      createdAt: prismaItem.createdAt,
    });
  }

  private toWithDetails(prismaItem: any): ForbiddenMedicationWithDetails {
    return {
      ...this.toDomain(prismaItem),
      medication: {
        id: prismaItem.medicationsDictionary.id,
        nome: prismaItem.medicationsDictionary.nome,
        laboratorio: prismaItem.medicationsDictionary.laboratorio,
        substancias: prismaItem.medicationsDictionary.substancias,
        apresentacoes: prismaItem.medicationsDictionary.apresentacoes,
        tarjas: prismaItem.medicationsDictionary.tarjas,
      },
    };
  }
}