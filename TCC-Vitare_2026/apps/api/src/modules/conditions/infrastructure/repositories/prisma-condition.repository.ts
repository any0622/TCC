import { Injectable } from '@nestjs/common';
import type { PrismaService } from '../../../../infra/prisma/prisma.service';
import { ConditionRepositoryPort } from '../../application/ports';
import { ChronicCondition, ConditionWithDisease } from '../../domain/repositories';

@Injectable()
export class PrismaConditionRepository implements ConditionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActiveByUser(userId: string): Promise<ConditionWithDisease[]> {
    const conditions = await this.prisma.chronicCondition.findMany({
      where: { userId, isActive: true },
      include: { disease: true },
      orderBy: { createdAt: 'desc' },
    });
    return conditions.map(this.toConditionWithDisease);
  }

  async findById(id: string): Promise<ConditionWithDisease | null> {
    const condition = await this.prisma.chronicCondition.findUnique({
      where: { id },
      include: { disease: true },
    });
    return condition ? this.toConditionWithDisease(condition) : null;
  }

  async save(condition: ChronicCondition): Promise<ChronicCondition> {
    const data = condition.toPersistence();
    const saved = await this.prisma.chronicCondition.create({ data });
    return this.toDomain(saved);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.chronicCondition.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private toDomain(prismaCondition: any): ChronicCondition {
    return ChronicCondition.reconstruct({
      id: prismaCondition.id,
      userId: prismaCondition.userId,
      diseaseId: prismaCondition.diseaseId,
      notes: prismaCondition.notes,
      diagnosedAt: prismaCondition.diagnosedAt,
      isActive: prismaCondition.isActive,
      createdAt: prismaCondition.createdAt,
    });
  }

  private toConditionWithDisease(prismaCondition: any): ConditionWithDisease {
    return {
      ...this.toDomain(prismaCondition),
      disease: {
        id: prismaCondition.disease.id,
        code: prismaCondition.disease.code,
        name: prismaCondition.disease.name,
      },
    };
  }
}