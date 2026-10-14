import { Injectable } from '@nestjs/common';
import type { AllergyRepositoryPort } from '../ports';
import { GetAllergiesQuery, AllergyResult } from '../dto/allergy.dto';

@Injectable()
export class GetAllergiesUseCase {
  constructor(private readonly allergyRepository: AllergyRepositoryPort) {}

  async execute(query: GetAllergiesQuery): Promise<AllergyResult[]> {
    const allergies = await this.allergyRepository.findAllByUser(query.userId);
    return allergies.map(this.toResult);
  }

  private toResult(allergy: any): AllergyResult {
    return {
      id: allergy.id,
      userId: allergy.userId,
      name: allergy.name,
      severity: allergy.severity,
      notes: allergy.notes,
      createdAt: allergy.createdAt,
    };
  }
}