import { Injectable } from '@nestjs/common';
import type { MedicationRepositoryPort } from '../ports';
import { GetActiveMedicationsQuery, MedicationResult } from '../dto/medication.dto';

@Injectable()
export class GetActiveMedicationsUseCase {
  constructor(private readonly medicationRepository: MedicationRepositoryPort) {}

  async execute(query: GetActiveMedicationsQuery): Promise<MedicationResult[]> {
    const medications = await this.medicationRepository.findAllActiveByUser(query.userId);
    return medications.map(this.toResult);
  }

  private toResult(medication: any): MedicationResult {
    return {
      id: medication.id,
      userId: medication.userId,
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      startDate: medication.startDate,
      endDate: medication.endDate,
      notes: medication.notes,
      isActive: medication.isActive,
      createdAt: medication.createdAt,
      updatedAt: medication.updatedAt,
    };
  }
}