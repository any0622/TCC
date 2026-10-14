/* eslint-disable @typescript-eslint/unbound-method */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import {
  ConditionsRepository,
  ConditionWithDisease,
} from './conditions.repository';

@Injectable()
export class PrismaConditionsRepository implements ConditionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** O(k) via �ndice (userId, isActive); include resolve disease em uma única query */
  async findAllActiveByUser(userId: string): Promise<ConditionWithDisease[]> {
    const rows = await this.prisma.chronicCondition.findMany({
      where: { userId, isActive: true },
      include: { disease: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(this.toDomain);
  }

  async findById(id: string): Promise<ConditionWithDisease | null> {
    const row = await this.prisma.chronicCondition.findUnique({
      where: { id },
      include: { disease: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async create(
    userId: string,
    diseaseId: string,
    data: { notes?: string; diagnosedAt?: Date },
  ): Promise<ConditionWithDisease> {
    const row = await this.prisma.chronicCondition.create({
      data: { userId, diseaseId, ...data },
      include: { disease: true },
    });
    return this.toDomain(row);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.chronicCondition.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private toDomain(row: {
    id: string;
    userId: string;
    diseaseId: string;
    disease: { name: string; code: string };
    notes: string | null;
    diagnosedAt: Date | null;
    isActive: boolean;
    createdAt: Date;
  }): ConditionWithDisease {
    return {
      id: row.id,
      userId: row.userId,
      diseaseId: row.diseaseId,
      diseaseName: row.disease.name,
      diseaseCode: row.disease.code,
      notes: row.notes,
      diagnosedAt: row.diagnosedAt,
      isActive: row.isActive,
      createdAt: row.createdAt,
    };
  }
}
