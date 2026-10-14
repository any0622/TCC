import { Injectable } from '@nestjs/common';
import type { ForbiddenMedicationRepositoryPort } from '../ports';
import { GetForbiddenMedicationsQuery, ForbiddenMedicationResult } from '../dto/forbidden-medication.dto';
import { ForbiddenMedicationWithDetails } from '../../domain/repositories';

@Injectable()
export class GetForbiddenMedicationsUseCase {
  constructor(private readonly repository: ForbiddenMedicationRepositoryPort) {}

  async execute(query: GetForbiddenMedicationsQuery): Promise<ForbiddenMedicationResult[]> {
    const items = await this.repository.findAllByUser(query.userId);
    return items.map(this.toResult);
  }

  private toResult(item: ForbiddenMedicationWithDetails): ForbiddenMedicationResult {
    return {
      id: item.id,
      userId: item.userId,
      medicationsDictionaryId: item.medicationsDictionaryId,
      reason: item.reason,
      createdAt: item.createdAt,
      medication: item.medication,
    };
  }
}