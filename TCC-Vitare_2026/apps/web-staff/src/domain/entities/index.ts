export interface Staff {
  id: string;
  fullName: string;
  email: string;
  cpf: string | null;
  registrationNumber: string;
  role: 'MEDICO_SOCORRISTA' | 'ENFERMEIRO_SOCORRISTA' | 'TECNICO_ENFERMAGEM' | 'OPERADOR_TACTICAL' | 'ADMINISTRATIVO';
}

export interface StaffTokenPair {
  accessToken: string;
  staff: Staff;
}

export interface Patient {
  id: string;
  fullName: string;
  cpf: string | null;
  birthDate: string | null;
  bloodType: string | null;
  weightKg: number | null;
  heightCm: number | null;
  conditions: Array<{ name: string; code: string }>;
  medications: Array<{ name: string; dosage: string; frequency: string }>;
  contacts: Array<{ name: string; phone: string; isPrimary: boolean }>;
  allergies: Array<{ name: string; severity: string | null; notes: string | null }>;
}

export interface EmergencyEvent {
  id: string;
  userId: string;
  user: {
    fullName: string;
    cpf: string | null;
    bloodType: string | null;
  };
  triggeredAt: string;
  latitude: number | null;
  longitude: number | null;
  patientSnapshot: any;
  status: 'TRIGGERED' | 'NOTIFIED' | 'RESOLVED';
  distance?: number;
}

export interface PatientLookupResult {
  patient: Patient;
  emergencyEvents: EmergencyEvent[];
}