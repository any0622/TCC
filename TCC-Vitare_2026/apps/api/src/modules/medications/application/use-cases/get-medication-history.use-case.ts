import { Injectable } from '@nestjs/common';
import type { MedicationRepositoryPort } from '../ports';
import { GetMedicationHistoryQuery, MedicationHistoryResult } from '../dto/medication.dto';
import { MedicationNotFoundException, MedicationAccessDeniedException } from '../../domain/exceptions';

@Injectable()
export class GetMedicationHistoryUseCase {
  constructor(private readonly medicationRepository: MedicationRepositoryPort) {}

  async execute(query: GetMedicationHistoryQuery): Promise<MedicationHistoryResult[]> {
    const medication = await this.medicationRepository.findById(query.medicationId);
    if (!medication) {
      throw new MedicationNotFoundException(query.medicationId);
    }
    if (medication.userId !== query.userId) {
      throw new MedicationAccessDeniedException();
    }

    const history = await this.medicationRepository.findHistoryByMedication(query.medicationId);
    return history.map(this.toResult);
  }

  private toResult(h: any): MedicationHistoryResult {
    return {
      id: h.id,
      medicationId: h.medicationId,
      userId: h.userId,
      changedAt: h.changedAt,
      changedField: h.changedField,
      oldValue: h.oldValue,
      newValue: h.newValue,
    };
  }
}