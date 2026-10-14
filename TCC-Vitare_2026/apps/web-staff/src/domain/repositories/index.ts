import { Staff, StaffTokenPair, Patient, EmergencyEvent, PatientLookupResult } from '../entities';

export interface StaffAuthRepository {
  login(data: { email: string; password: string }): Promise<StaffTokenPair>;
  register(data: { fullName: string; email: string; cpf: string; registrationNumber: string; role: string; password: string }): Promise<StaffTokenPair>;
  bootstrapAdmin(data: { fullName: string; email: string; cpf: string; registrationNumber: string; password: string }): Promise<StaffTokenPair>;
  me(): Promise<Staff>;
}

export interface EmergencyRepository {
  findAll(cursor?: string, limit?: number): Promise<{ data: EmergencyEvent[]; nextCursor: string | null; hasMore: boolean }>;
  findNearby(latitude: number, longitude: number, radiusKm: number): Promise<EmergencyEvent[]>;
  getPatientSnapshot(emergencyId: string): Promise<any>;
}

export interface PatientLookupRepository {
  searchByCPF(cpf: string): Promise<PatientLookupResult>;
  searchByName(name: string): Promise<PatientLookupResult>;
}