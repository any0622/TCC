export const DISEASE_DICTIONARY_REPOSITORY_PORT = 'DISEASE_DICTIONARY_REPOSITORY_PORT';
import { DiseaseSearchResult } from '../../domain/repositories';

export interface DiseaseDictionaryRepositoryPort {
  search(query: string): Promise<DiseaseSearchResult[]>;
  findById(id: string): Promise<DiseaseSearchResult | null>;
}