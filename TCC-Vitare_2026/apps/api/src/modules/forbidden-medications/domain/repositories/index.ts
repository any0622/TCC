import { ForbiddenMedication, ForbiddenMedicationWithDetails } from '../entities/forbidden-medication.entity';
import { ForbiddenMedicationProps } from '../entities/forbidden-medication.entity';

export { ForbiddenMedication, ForbiddenMedicationProps, ForbiddenMedicationWithDetails };

export interface CreateForbiddenMedicationData {
  userId: string;
  medicationsDictionaryId: string;
  reason: string;
}

export abstract class ForbiddenMedicationRepository {
  abstract findAllByUser(userId: string): Promise<ForbiddenMedicationWithDetails[]>;
  abstract findById(id: string): Promise<ForbiddenMedicationWithDetails | null>;
  abstract findByUserAndMedication(userId: string, medicationsDictionaryId: string): Promise<ForbiddenMedication | null>;
  abstract save(forbidden: ForbiddenMedication): Promise<ForbiddenMedication>;
  abstract remove(id: string): Promise<void>;
}