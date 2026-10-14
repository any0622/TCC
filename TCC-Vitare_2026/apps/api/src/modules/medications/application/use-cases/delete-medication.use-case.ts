import { Injectable } from '@nestjs/common';
import type { MedicationRepositoryPort } from '../ports';
import { DeleteMedicationCommand } from '../dto/medication.dto';
import { MedicationNotFoundException, MedicationAccessDeniedException } from '../../domain/exceptions';

@Injectable()
export class DeleteMedicationUseCase {
  constructor(private readonly medicationRepository: MedicationRepositoryPort) {}

  async execute(command: DeleteMedicationCommand): Promise<void> {
    const existing = await this.medicationRepository.findById(command.id);
    if (!existing) {
      throw new MedicationNotFoundException(command.id);
    }
    if (existing.userId !== command.userId) {
      throw new MedicationAccessDeniedException();
    }
    await this.medicationRepository.softDelete(command.id);
  }
}