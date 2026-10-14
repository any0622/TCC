import { Injectable } from '@nestjs/common';
import type { ConditionRepositoryPort } from '../ports';
import { CreateConditionCommand, ConditionResult } from '../dto/condition.dto';
import { ChronicCondition } from '../../domain/entities/chronic-condition.entity';

@Injectable()
export class CreateConditionUseCase {
  constructor(private readonly conditionRepository: ConditionRepositoryPort) {}

  async execute(command: CreateConditionCommand): Promise<ConditionResult> {
    const condition = ChronicCondition.create({
      userId: command.userId,
      diseaseId: command.diseaseId,
      notes: command.notes ?? null,
      diagnosedAt: command.diagnosedAt ? new Date(command.diagnosedAt) : null,
      isActive: true,
    });

    const saved = await this.conditionRepository.save(condition);
    return this.toResult(saved);
  }

  private toResult(condition: ChronicCondition): ConditionResult {
    return {
      id: condition.id,
      userId: condition.userId,
      diseaseId: condition.diseaseId,
      disease: { id: '', code: '', name: '' },
      notes: condition.notes,
      diagnosedAt: condition.diagnosedAt,
      isActive: condition.isActive,
      createdAt: condition.createdAt,
    };
  }
}