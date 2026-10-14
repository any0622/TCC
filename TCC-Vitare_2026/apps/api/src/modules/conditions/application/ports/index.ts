export const CONDITION_REPOSITORY_PORT = 'CONDITION_REPOSITORY_PORT';

import { ChronicCondition, ConditionWithDisease } from '../../domain/repositories';

export interface ConditionRepositoryPort {
  findAllActiveByUser(userId: string): Promise<ConditionWithDisease[]>;
  findById(id: string): Promise<ConditionWithDisease | null>;
  save(condition: ChronicCondition): Promise<ChronicCondition>;
  softDelete(id: string): Promise<void>;
}