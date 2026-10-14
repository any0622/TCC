import { Injectable } from '@nestjs/common';
import type { DiseaseDictionaryRepositoryPort } from '../ports';
import { SearchDiseaseQuery, DiseaseSearchResult } from '../dto/disease-dictionary.dto';

@Injectable()
export class SearchDiseasesUseCase {
  constructor(private readonly repository: DiseaseDictionaryRepositoryPort) {}

  async execute(query: SearchDiseaseQuery): Promise<DiseaseSearchResult[]> {
    if (!query.query || query.query.length < 2) return [];
    return this.repository.search(query.query);
  }
}
