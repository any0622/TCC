export const MEDICATIONS_DICTIONARY_REPOSITORY_PORT = 'MEDICATIONS_DICTIONARY_REPOSITORY_PORT';
import { MedicationSearchResult } from '../../domain/repositories';

export interface MedicationsDictionaryRepositoryPort {
  search(query: string): Promise<MedicationSearchResult[]>;
  findById(id: string): Promise<MedicationSearchResult | null>;
}