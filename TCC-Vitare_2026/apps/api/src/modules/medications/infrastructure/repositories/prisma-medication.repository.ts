import { Injectable } from '@nestjs/common';
import type { PrismaService } from '../../../../infra/prisma/prisma.service';
import { MedicationRepositoryPort } from '../../application/ports';
import { Medication, MedicationHistory } from '../../domain/entities/medication.entity';

@Injectable()
export class PrismaMedicationRepository implements MedicationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActiveByUser(userId: string): Promise<Medication[]> {
    const medications = await this.prisma.medication.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return medications.map(this.toDomain);
  }

  async findById(id: string): Promise<Medication | null> {
    const medication = await this.prisma.medication.findUnique({ where: { id } });
    return medication ? this.toDomain(medication) : null;
  }

  async save(medication: Medication): Promise<Medication> {
    const data = medication.toPersistence();
    const saved = await this.prisma.medication.create({ data });
    return this.toDomain(saved);
  }

  async update(id: string, data: {
    name?: string;
    dosage?: string;
    frequency?: string;
    startDate?: Date;
    endDate?: Date;
    notes?: string;
    isActive?: boolean;
  }): Promise<Medication> {
    const updated = await this.prisma.medication.update({
      where: { id },
      data,
    });
    return this.toDomain(updated);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.medication.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findHistoryByMedication(medicationId: string): Promise<MedicationHistory[]> {
    const history = await this.prisma.medicationHistory.findMany({
      where: { medicationId },
      orderBy: { changedAt: 'desc' },
    });
    return history.map(this.toHistoryDomain);
  }

  async recordHistoryEntries(entries: Array<{
    medicationId: string;
    userId: string;
    changedField: string;
    oldValue: string | null;
    newValue: string | null;
  }>): Promise<void> {
    await this.prisma.medicationHistory.createMany({
      data: entries.map(e => ({
        medicationId: e.medicationId,
        userId: e.userId,
        changedField: e.changedField,
        oldValue: e.oldValue,
        newValue: e.newValue,
      })),
    });
  }

  private toDomain(prismaMed: any): Medication {
    return Medication.reconstruct({
      id: prismaMed.id,
      userId: prismaMed.userId,
      name: prismaMed.name,
      dosage: prismaMed.dosage,
      frequency: prismaMed.frequency,
      startDate: prismaMed.startDate,
      endDate: prismaMed.endDate,
      notes: prismaMed.notes,
      isActive: prismaMed.isActive,
      createdAt: prismaMed.createdAt,
      updatedAt: prismaMed.updatedAt,
    });
  }

  private toHistoryDomain(prismaHistory: any): MedicationHistory {
    return MedicationHistory.reconstruct({
      id: prismaHistory.id,
      medicationId: prismaHistory.medicationId,
      userId: prismaHistory.userId,
      changedAt: prismaHistory.changedAt,
      changedField: prismaHistory.changedField,
      oldValue: prismaHistory.oldValue,
      newValue: prismaHistory.newValue,
    });
  }
}