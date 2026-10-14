export interface CreateConditionCommand {
  userId: string;
  diseaseId: string;
  notes?: string;
  diagnosedAt?: string;
}

export interface RemoveConditionCommand {
  id: string;
  userId: string;
}

export interface GetConditionsQuery {
  userId: string;
}

export interface ConditionResult {
  id: string;
  userId: string;
  diseaseId: string;
  disease: {
    id: string;
    code: string;
    name: string;
  };
  notes: string | null;
  diagnosedAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}