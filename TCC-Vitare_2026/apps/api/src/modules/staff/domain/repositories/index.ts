import { Staff } from '../entities/staff.entity';

export interface CreateStaffData {
  fullName: string;
  email: string;
  cpf: string;
  registrationNumber: string;
  role: 'MEDICO_SOCORRISTA' | 'ENFERMEIRO_SOCORRISTA' | 'TECNICO_ENFERMAGEM' | 'OPERADOR_TACTICAL' | 'ADMINISTRATIVO';
  passwordHash: string;
}

export abstract class StaffRepository {
  abstract findByEmail(email: string): Promise<Staff | null>;
  abstract findById(id: string): Promise<Staff | null>;
  abstract findAny(): Promise<Staff | null>;
  abstract save(staff: Staff): Promise<Staff>;
}