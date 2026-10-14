export const ALLERGIES_REPOSITORY_PORT = 'ALLERGIES_REPOSITORY_PORT';
import { Allergy } from '../../domain/entities/allergy.entity';

export const ALLERGY_REPOSITORY_PORT = 'ALLERGY_REPOSITORY_PORT';

export interface AllergyRepositoryPort {
  findAllByUser(userId: string): Promise<Allergy[]>;
  findById(id: string): Promise<Allergy | null>;
  save(allergy: Allergy): Promise<Allergy>;
  remove(id: string): Promise<void>;
}