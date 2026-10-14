export interface User {
  id: string;
  fullName: string;
  email: string;
  cpf: string | null;
  phone: string | null;
  address: string | null;
  birthDate: string | null;
  bloodType: string | null;
  weightKg: number | null;
  heightCm: number | null;
  createdAt: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string | null;
  isPrimary: boolean;
  createdAt: string;
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChronicCondition {
  id: string;
  userId: string;
  diseaseId: string;
  disease: { id: string; code: string; name: string };
  notes: string | null;
  diagnosedAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Allergy {
  id: string;
  userId: string;
  name: string;
  severity: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ForbiddenMedication {
  id: string;
  userId: string;
  medicationsDictionaryId: string;
  reason: string;
  createdAt: string;
  medication: {
    id: string;
    nome: string;
    laboratorio: string;
    substancias: string[];
    apresentacoes: string[];
    tarjas: string[];
  };
}

export interface EmergencyEvent {
  id: string;
  userId: string;
  triggeredAt: string;
  latitude: number | null;
  longitude: number | null;
  patientSnapshot: any;
  status: 'TRIGGERED' | 'NOTIFIED' | 'RESOLVED';
  notes: string | null;
}

export interface DiseaseDictionaryResult {
  id: string;
  code: string;
  name: string;
  groupName: string | null;
}

export interface MedicationDictionaryResult {
  id: string;
  nome: string;
  laboratorio: string;
  substancias: string[];
  apresentacoes: string[];
  tarjas: string[];
}