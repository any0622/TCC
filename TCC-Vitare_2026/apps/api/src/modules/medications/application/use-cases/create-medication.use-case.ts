import { Injectable } from '@nestjs/common';
import type { MedicationRepositoryPort } from '../ports';
import { CreateMedicationCommand, MedicationResult } from '../dto/medication.dto';
import { Medication, MedicationName, Dosage, Frequency } from '../../domain/entities/medication.entity';
import { InvalidMedicationDataException } from '../../domain/exceptions';

@Injectable()
export class CreateMedicationUseCase {
  constructor(private readonly medicationRepository: MedicationRepositoryPort) {}

  async execute(command: CreateMedicationCommand): Promise<MedicationResult> {
    const name = MedicationName.create(command.name);
    const dosage = Dosage.create(command.dosage);
    const frequency = Frequency.create(command.frequency);

    const medication = Medication.create({
      userId: command.userId,
      name: name.getValue(),
      dosage: dosage.getValue(),
      frequency: frequency.getValue(),
      startDate: new Date(command.startDate),
      endDate: command.endDate ? new Date(command.endDate) : null,
      notes: command.notes ?? null,
      isActive: true,
    });

    const saved = await this.medicationRepository.save(medication);
    return this.toResult(saved);
  }

  private toResult(medication: Medication): MedicationResult {
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