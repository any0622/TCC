import { Injectable } from '@nestjs/common';
import type { ForbiddenMedicationRepositoryPort } from '../ports';
import { RemoveForbiddenMedicationCommand } from '../dto/forbidden-medication.dto';
import { ForbiddenMedicationNotFoundException, ForbiddenMedicationAccessDeniedException } from '../../domain/exceptions';

@Injectable()
export class RemoveForbiddenMedicationUseCase {
  constructor(private readonly repository: ForbiddenMedicationRepositoryPort) {}

  async execute(command: RemoveForbiddenMedicationCommand): Promise<void> {
    const existing = await this.repository.findById(command.id);
    if (!existing) {
      throw new ForbiddenMedicationNotFoundException(command.id);
    }
    if (existing.userId !== command.userId) {
      throw new ForbiddenMedicationAccessDeniedException();
    }
    await this.repository.remove(command.id);
  }
}