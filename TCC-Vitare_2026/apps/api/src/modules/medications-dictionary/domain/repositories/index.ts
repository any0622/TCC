import { MedicationsDictionary } from '../entities/medications-dictionary.entity';

export interface MedicationSearchResult {
  id: string;
  nome: string;
  laboratorio: string;
  substancias: string[];
  apresentacoes: string[];
  tarjas: string[];
}

export abstract class MedicationsDictionaryRepository {
  abstract search(query: string): Promise<MedicationSearchResult[]>;
  abstract findById(id: string): Promise<MedicationSearchResult | null>;
}