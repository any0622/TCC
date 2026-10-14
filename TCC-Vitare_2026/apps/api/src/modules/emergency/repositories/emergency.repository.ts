import { EmergencyEvent } from '../../../../generated/prisma/client';

export interface PatientSnapshot {
  patient: {
    fullName: string;
    cpf: string | null;
    bloodType: string | null;
    birthDate: string | null;
    weightKg: number | null;
    heightCm: number | null;
  };
  conditions: Array<{ name: string; code: string }>;
  medications: Array<{ name: string; dosage: string; frequency: string }>;
  contacts: Array<{ name: string; phone: string; isPrimary: boolean }>;
  allergies: Array<{
    name: string;
    severity: string | null;
    notes: string | null;
  }>;
  capturedAt: string;
}

export interface CursorPaginationOptions {
  cursor?: string;
  limit: number;
}

export interface CursorPaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export abstract class EmergencyRepository {
  abstract trigger(data: {
    userId: string;
    latitude?: number;
    longitude?: number;
  }): Promise<EmergencyEvent>;
  abstract findAllByUser(userId: string): Promise<EmergencyEvent[]>;
  abstract findByUserWithCursor(
    userId: string,
    options: CursorPaginationOptions,
  ): Promise<CursorPaginatedResult<EmergencyEvent>>;
}
