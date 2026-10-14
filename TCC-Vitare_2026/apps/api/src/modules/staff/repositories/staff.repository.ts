import { Staff } from '../../../../generated/prisma/client';

export abstract class StaffRepository {
  abstract findByEmail(email: string): Promise<Staff | null>;
  abstract findById(id: string): Promise<Staff | null>;
  abstract findAny(): Promise<Staff | null>;
  abstract create(data: {
    fullName: string;
    email: string;
    cpf: string;
    registrationNumber: string;
    role: string;
    passwordHash: string;
  }): Promise<Staff>;
}
