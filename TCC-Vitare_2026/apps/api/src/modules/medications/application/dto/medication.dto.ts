export interface CreateMedicationCommand {
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  notes?: string;
}

export interface UpdateMedicationCommand {
  id: string;
  userId: string;
  name?: string;
  dosage?: string;
  frequency?: string;
  startDate?: string | null;
  endDate?: string | null;
  notes?: string;
  isActive?: boolean;
}

export interface DeleteMedicationCommand {
  id: string;
  userId: string;
}

export interface GetMedicationHistoryQuery {
  medicationId: string;
  userId: string;
}

export interface GetActiveMedicationsQuery {
  userId: string;
}

export interface MedicationResult {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate: Date | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicationHistoryResult {
  id: string;
  medicationId: string;
  userId: string;
  changedAt: Date;
  changedField: string;
  oldValue: string | null;
  newValue: string | null;
}