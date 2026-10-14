import { Injectable } from '@nestjs/common';
import type { ForbiddenMedicationRepositoryPort } from '../ports';
import { CreateForbiddenMedicationCommand, ForbiddenMedicationResult } from '../dto/forbidden-medication.dto';
import { ForbiddenMedication } from '../../domain/entities/forbidden-medication.entity';
import { ForbiddenMedicationAlreadyExistsException } from '../../domain/exceptions';

@Injectable()
export class CreateForbiddenMedicationUseCase {
  constructor(private readonly repository: ForbiddenMedicationRepositoryPort) {}

  async execute(command: CreateForbiddenMedicationCommand): Promise<ForbiddenMedicationResult> {
    const existing = await this.repository.findByUserAndMedication(command.userId, command.medicationsDictionaryId);
    if (existing) {
      throw new ForbiddenMedicationAlreadyExistsException();
    }

    const forbidden = ForbiddenMedication.create({
      userId: command.userId,
      medicationsDictionaryId: command.medicationsDictionaryId,
      reason: command.reason,
    });

    const saved = await this.repository.save(forbidden);
    return this.toResult(saved);
  }

  private toResult(forbidden: ForbiddenMedication): ForbiddenMedicationResult {
    return {
      id: forbidden.id,
      userId: forbidden.userId,
      medicationsDictionaryId: forbidden.medicationsDictionaryId,
      reason: forbidden.reason,
      createdAt: forbidden.createdAt,
      medication: { id: '', nome: '', laboratorio: '', substancias: [], apresentacoes: [], tarjas: [] },
    };
  }
}