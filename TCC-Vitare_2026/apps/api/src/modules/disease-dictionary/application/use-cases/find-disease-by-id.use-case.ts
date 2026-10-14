import { Injectable } from '@nestjs/common';
import type { DiseaseDictionaryRepositoryPort } from '../ports';
import { FindDiseaseByIdQuery, DiseaseSearchResult } from '../dto/disease-dictionary.dto';

@Injectable()
export class FindDiseaseByIdUseCase {
  constructor(private readonly repository: DiseaseDictionaryRepositoryPort) {}

  async execute(query: FindDiseaseByIdQuery): Promise<DiseaseSearchResult | null> {
    return this.repository.findById(query.id);
  }
}
