export const FORBIDDEN_MEDICATION_REPOSITORY_PORT = 'FORBIDDEN_MEDICATION_REPOSITORY_PORT';

export const FORBIDDEN_MEDICATIONS_REPOSITORY_PORT = 'FORBIDDEN_MEDICATIONS_REPOSITORY_PORT';
import { ForbiddenMedication, ForbiddenMedicationWithDetails } from '../../domain/repositories';

export interface ForbiddenMedicationRepositoryPort {
  findAllByUser(userId: string): Promise<ForbiddenMedicationWithDetails[]>;
  findById(id: string): Promise<ForbiddenMedicationWithDetails | null>;
  findByUserAndMedication(userId: string, medicationsDictionaryId: string): Promise<ForbiddenMedication | null>;
  save(forbidden: ForbiddenMedication): Promise<ForbiddenMedication>;
  remove(id: string): Promise<void>;
}