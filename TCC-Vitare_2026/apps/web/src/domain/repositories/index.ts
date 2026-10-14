import {
  User,
  TokenPair,
  EmergencyContact,
  Medication,
  ChronicCondition,
  Allergy,
  ForbiddenMedication,
  EmergencyEvent,
  DiseaseDictionaryResult,
  MedicationDictionaryResult,
} from '../entities';

export interface AuthRepository {
  register(data: { fullName: string; email: string; password: string }): Promise<TokenPair>;
  login(data: { email: string; password: string }): Promise<TokenPair>;
  refresh(refreshToken: string): Promise<TokenPair>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  exchangeGoogleCode(code: string): Promise<TokenPair>;
}

export interface PatientRepository {
  getProfile(): Promise<User>;
  updateProfile(data: Partial<User>): Promise<User>;
  deleteAccount(): Promise<void>;
}

export interface EmergencyContactRepository {
  findAll(): Promise<EmergencyContact[]>;
  create(data: { name: string; phone: string; relationship?: string; isPrimary?: boolean }): Promise<EmergencyContact>;
  remove(id: string): Promise<void>;
}

export interface MedicationRepository {
  findAllActive(): Promise<Medication[]>;
  create(data: { name: string; dosage: string; frequency: string; startDate: string; endDate?: string; notes?: string }): Promise<Medication>;
  update(id: string, data: Partial<Medication>): Promise<Medication>;
  remove(id: string): Promise<void>;
  getHistory(id: string): Promise<Array<{ id: string; medicationId: string; changedAt: string; changedField: string; oldValue: string | null; newValue: string | null }>>;
}

export interface ConditionRepository {
  findAllActive(): Promise<ChronicCondition[]>;
  create(data: { diseaseId: string; notes?: string; diagnosedAt?: string }): Promise<ChronicCondition>;
  remove(id: string): Promise<void>;
}

export interface AllergyRepository {
  findAll(): Promise<Allergy[]>;
  create(data: { name: string; severity?: string; notes?: string }): Promise<Allergy>;
  remove(id: string): Promise<void>;
}

export interface ForbiddenMedicationRepository {
  findAll(): Promise<ForbiddenMedication[]>;
  create(data: { medicationsDictionaryId: string; reason: string }): Promise<ForbiddenMedication>;
  remove(id: string): Promise<void>;
}

export interface EmergencyRepository {
  trigger(data: { latitude?: number; longitude?: number; idempotencyKey: string }): Promise<EmergencyEvent>;
  findAll(): Promise<EmergencyEvent[]>;
  findAllWithCursor(cursor?: string, limit?: number): Promise<{ data: EmergencyEvent[]; nextCursor: string | null; hasMore: boolean }>;
}

export interface DiseaseDictionaryRepository {
  search(query: string): Promise<DiseaseDictionaryResult[]>;
  findById(id: string): Promise<DiseaseDictionaryResult | null>;
}

export interface MedicationDictionaryRepository {
  search(query: string): Promise<MedicationDictionaryResult[]>;
  findById(id: string): Promise<MedicationDictionaryResult | null>;
}