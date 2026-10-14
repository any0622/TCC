import { User } from '../../../../generated/prisma/client';

export abstract class PatientsRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract update(id: string, data: Partial<User>): Promise<User>;
  abstract remove(id: string): Promise<void>;
}
