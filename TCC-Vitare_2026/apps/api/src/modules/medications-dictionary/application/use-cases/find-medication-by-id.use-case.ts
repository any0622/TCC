import { Injectable } from '@nestjs/common';
import type { MedicationsDictionaryRepositoryPort } from '../ports';
import { FindMedicationByIdQuery, MedicationSearchResult } from '../dto/medications-dictionary.dto';

@Injectable()
export class FindMedicationByIdUseCase {
  constructor(private readonly repository: MedicationsDictionaryRepositoryPort) {}

  async execute(query: FindMedicationByIdQuery): Promise<MedicationSearchResult | null> {
    return this.repository.findById(query.id);
  }
}
