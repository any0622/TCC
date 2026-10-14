/* eslint-disable @typescript-eslint/unbound-method */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import {
  ForbiddenMedicationsRepository,
  ForbiddenMedicationWithDetails,
} from './forbidden-medications.repository';

@Injectable()
export class PrismaForbiddenMedicationsRepository implements ForbiddenMedicationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** O(k) via �ndice em userId; include resolve o dicionário em uma única query */
  async findAllByUser(
    userId: string,
  ): Promise<ForbiddenMedicationWithDetails[]> {
    const rows = await this.prisma.forbiddenMedication.findMany({
      where: { userId },
      include: { medicationsDictionary: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(this.toDomain);
  }

  async findById(id: string): Promise<ForbiddenMedicationWithDetails | null> {
    const row = await this.prisma.forbiddenMedication.findUnique({
      where: { id },
      include: { medicationsDictionary: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async create(
    userId: string,
    data: { medicationsDictionaryId: string; reason: string },
  ): Promise<ForbiddenMedicationWithDetails> {
    const row = await this.prisma.forbiddenMedication.create({
      data: { ...data, userId },
      include: { medicationsDictionary: true },
    });
    return this.toDomain(row);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.forbiddenMedication.delete({ where: { id } });
  }

  private toDomain(row: {
    id: string;
    userId: string;
    medicationsDictionaryId: string;
    reason: string;
    createdAt: Date;
    medicationsDictionary: { nome: string; laboratorio: string };
  }): ForbiddenMedicationWithDetails {
    return {
      id: row.id,
      userId: row.userId,
      medicationsDictionaryId: row.medicationsDictionaryId,
      medicationsName: row.medicationsDictionary.nome,
      medicationsLaboratorio: row.medicationsDictionary.laboratorio,
      reason: row.reason,
      createdAt: row.createdAt,
    };
  }
}
