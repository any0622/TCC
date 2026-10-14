import { Injectable } from '@nestjs/common';
import type { MedicationsDictionaryRepositoryPort } from '../ports';
import { SearchMedicationQuery, MedicationSearchResult } from '../dto/medications-dictionary.dto';

@Injectable()
export class SearchMedicationsUseCase {
  constructor(private readonly repository: MedicationsDictionaryRepositoryPort) {}

  async execute(query: SearchMedicationQuery): Promise<MedicationSearchResult[]> {
    if (!query.query || query.query.length < 2) return [];
    return this.repository.search(query.query);
  }
}
