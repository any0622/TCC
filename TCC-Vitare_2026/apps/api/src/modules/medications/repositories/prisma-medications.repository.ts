import { Injectable } from '@nestjs/common';
import type { Medication } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import {
  CreateMedicationData,
  MedicationsRepository,
  UpdateMedicationData,
} from './medications.repository';

@Injectable()
export class PrismaMedicationsRepository implements MedicationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActiveByUser(userId: string): Promise<Medication[]> {
    const rows = await this.prisma.medication.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows;
  }

  async findById(id: string): Promise<Medication | null> {
    const row = await this.prisma.medication.findUnique({ where: { id } });
    return row;
  }

  async create(data: CreateMedicationData): Promise<Medication> {
    const row = await this.prisma.medication.create({
      data,
    });
    return row;
  }

  async update(id: string, data: UpdateMedicationData): Promise<Medication> {
    const row = await this.prisma.medication.update({
      where: { id },
      data,
    });
    return row;
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.medication.update({
      where: { id },
      data: { isActive: false },
    });
  }

  findHistoryByMedication(medicationId: string) {
    return this.prisma.medicationHistory.findMany({
      where: { medicationId },
      orderBy: { changedAt: 'desc' },
    });
  }

  async recordHistoryEntries(
    entries: Array<{
      medicationId: string;
      userId: string;
      changedField: string;
      oldValue: string | null;
      newValue: string | null;
    }>,
  ): Promise<void> {
    if (entries.length === 0) return;
    await this.prisma.medicationHistory.createMany({ data: entries });
  }
}
