export const MEDICATION_REPOSITORY_PORT = 'MEDICATION_REPOSITORY_PORT';
export const MEDICATION_RESTRICTION_SERVICE_PORT = 'MEDICATION_RESTRICTION_SERVICE_PORT';

export const MEDICATIONS_REPOSITORY_PORT = 'MEDICATIONS_REPOSITORY_PORT';
import { Medication, MedicationHistory } from '../../domain/entities/medication.entity';
import { MedicationRestrictionService } from '../../domain/services/medication-restriction.service';

export interface MedicationRepositoryPort {
  findAllActiveByUser(userId: string): Promise<Medication[]>;
  findById(id: string): Promise<Medication | null>;
  save(medication: Medication): Promise<Medication>;
  update(id: string, data: {
    name?: string;
    dosage?: string;
    frequency?: string;
    startDate?: Date;
    endDate?: Date;
    notes?: string;
    isActive?: boolean;
  }): Promise<Medication>;
  softDelete(id: string): Promise<void>;
  findHistoryByMedication(medicationId: string): Promise<MedicationHistory[]>;
  recordHistoryEntries(entries: Array<{
    medicationId: string;
    userId: string;
    changedField: string;
    oldValue: string | null;
    newValue: string | null;
  }>): Promise<void>;
}

export interface MedicationRestrictionServicePort extends MedicationRestrictionService {}