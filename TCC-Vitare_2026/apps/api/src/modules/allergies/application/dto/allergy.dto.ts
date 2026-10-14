export interface CreateAllergyCommand {
  userId: string;
  name: string;
  severity?: string;
  notes?: string;
}

export interface RemoveAllergyCommand {
  id: string;
  userId: string;
}

export interface GetAllergiesQuery {
  userId: string;
}

export interface AllergyResult {
  id: string;
  userId: string;
  name: string;
  severity: string | null;
  notes: string | null;
  createdAt: Date;
}