export const STAFF_REPOSITORY_PORT = 'STAFF_REPOSITORY_PORT';
import { Staff } from '../../domain/entities/staff.entity';

export interface StaffRepositoryPort {
  findByEmail(email: string): Promise<Staff | null>;
  findById(id: string): Promise<Staff | null>;
  findAny(): Promise<Staff | null>;
  save(staff: Staff): Promise<Staff>;
}

export interface HashingServicePort {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

export interface TokenGeneratorPort {
  generateAccessToken(payload: Record<string, unknown>, expiresIn: string): string;
  hashToken(token: string): string;
}