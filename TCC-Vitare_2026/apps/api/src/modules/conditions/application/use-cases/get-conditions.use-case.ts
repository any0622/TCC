import { Injectable } from '@nestjs/common';
import type { ConditionRepositoryPort } from '../ports';
import { GetConditionsQuery, ConditionResult } from '../dto/condition.dto';
import { ConditionWithDisease } from '../../domain/repositories';

@Injectable()
export class GetConditionsUseCase {
  constructor(private readonly conditionRepository: ConditionRepositoryPort) {}

  async execute(query: GetConditionsQuery): Promise<ConditionResult[]> {
    const conditions = await this.conditionRepository.findAllActiveByUser(query.userId);
    return conditions.map(this.toResult);
  }

  private toResult(c: ConditionWithDisease): ConditionResult {
    return {
      id: c.id,
      userId: c.userId,
      diseaseId: c.diseaseId,
      disease: c.disease,
      notes: c.notes,
      diagnosedAt: c.diagnosedAt,
      isActive: c.isActive,
      createdAt: c.createdAt,
    };
  }
}