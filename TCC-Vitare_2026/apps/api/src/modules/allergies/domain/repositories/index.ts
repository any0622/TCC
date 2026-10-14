import { Allergy } from '../entities/allergy.entity';

export interface CreateAllergyData {
  userId: string;
  name: string;
  severity?: string;
  notes?: string;
}

export abstract class AllergyRepository {
  abstract findAllByUser(userId: string): Promise<Allergy[]>;
  abstract findById(id: string): Promise<Allergy | null>;
  abstract save(allergy: Allergy): Promise<Allergy>;
  abstract remove(id: string): Promise<void>;
}