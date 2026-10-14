import { ChronicCondition } from '../entities/chronic-condition.entity';

export interface ConditionWithDisease extends ChronicConditionProps {
  disease: {
    id: string;
    code: string;
    name: string;
  };
}

export interface CreateConditionData {
  userId: string;
  diseaseId: string;
  notes?: string;
  diagnosedAt?: Date;
}

export abstract class ConditionRepository {
  abstract findAllActiveByUser(userId: string): Promise<ConditionWithDisease[]>;
  abstract findById(id: string): Promise<ConditionWithDisease | null>;
  abstract save(condition: ChronicCondition): Promise<ChronicCondition>;
  abstract softDelete(id: string): Promise<void>;
}

export interface ChronicConditionProps {
  id: string;
  userId: string;
  diseaseId: string;
  notes: string | null;
  diagnosedAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}