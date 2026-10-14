export const PATIENT_REPOSITORY_PORT = 'PATIENT_REPOSITORY_PORT';

export const PATIENTS_REPOSITORY_PORT = 'PATIENTS_REPOSITORY_PORT';
import { PatientProfile } from '../../domain/entities/patient-profile.entity';

export interface PatientRepositoryPort {
  findById(id: string): Promise<PatientProfile | null>;
  save(profile: PatientProfile): Promise<PatientProfile>;
  remove(id: string): Promise<void>;
}