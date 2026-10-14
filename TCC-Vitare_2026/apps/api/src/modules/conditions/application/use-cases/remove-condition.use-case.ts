import { Injectable } from '@nestjs/common';
import type { ConditionRepositoryPort } from '../ports';
import { RemoveConditionCommand } from '../dto/condition.dto';
import { ConditionNotFoundException, ConditionAccessDeniedException } from '../../domain/exceptions';

@Injectable()
export class RemoveConditionUseCase {
  constructor(private readonly conditionRepository: ConditionRepositoryPort) {}

  async execute(command: RemoveConditionCommand): Promise<void> {
    const existing = await this.conditionRepository.findById(command.id);
    if (!existing) {
      throw new ConditionNotFoundException(command.id);
    }
    if (existing.userId !== command.userId) {
      throw new ConditionAccessDeniedException();
    }
    await this.conditionRepository.softDelete(command.id);
  }
}