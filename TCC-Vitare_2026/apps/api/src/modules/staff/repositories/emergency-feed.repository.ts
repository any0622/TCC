import { EmergencyEvent } from '../../../../generated/prisma/client';

export interface StaffEmergencyFeedItem extends Omit<
  EmergencyEvent,
  'patientSnapshot'
> {
  patientSnapshot: {
    patient: {
      fullName: string;
      cpf: string | null;
      bloodType: string | null;
      birthDate: string | null;
      weightKg: number | null;
      heightCm: number | null;
    };
    conditions: Array<{ name: string; code: string }>;
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
    }>;
    contacts: Array<{ name: string; phone: string; isPrimary: boolean }>;
    allergies: Array<{
      name: string;
      severity: string | null;
      notes: string | null;
    }>;
    capturedAt: string;
  };
}

export abstract class EmergencyFeedRepository {
  abstract findRecent(limit: number): Promise<StaffEmergencyFeedItem[]>;
}
