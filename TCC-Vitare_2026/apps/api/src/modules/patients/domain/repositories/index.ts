import { PatientProfile } from '../entities/patient-profile.entity';

export abstract class PatientRepository {
  abstract findById(id: string): Promise<PatientProfile | null>;
  abstract save(profile: PatientProfile): Promise<PatientProfile>;
  abstract remove(id: string): Promise<void>;
}