export interface GetPatientProfileQuery {
  userId: string;
}

export interface UpdatePatientProfileCommand {
  userId: string;
  fullName?: string;
  birthDate?: string | null;
  bloodType?: string | null;
  weightKg?: number | null;
  heightCm?: number | null;
  cpf?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface DeletePatientAccountCommand {
  userId: string;
}

export interface PatientProfileResult {
  id: string;
  fullName: string;
  email: string;
  cpf: string | null;
  phone: string | null;
  address: string | null;
  birthDate: Date | null;
  bloodType: string | null;
  weightKg: number | null;
  heightCm: number | null;
  createdAt: Date;
  updatedAt: Date;
}