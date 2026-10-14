import { Injectable } from '@nestjs/common';
import type { MedicationRepositoryPort } from '../ports';
import { UpdateMedicationCommand, MedicationResult } from '../dto/medication.dto';
import { Medication } from '../../domain/entities/medication.entity';
import { MedicationName, Dosage, Frequency } from '../../domain/entities/medication.entity';
import { MedicationNotFoundException, MedicationAccessDeniedException, InvalidMedicationDataException } from '../../domain/exceptions';

const AUDITED_FIELDS = ['name', 'dosage', 'frequency', 'notes', 'isActive'] as const;

@Injectable()
export class UpdateMedicationUseCase {
  constructor(private readonly medicationRepository: MedicationRepositoryPort) {}

  async execute(command: UpdateMedicationCommand): Promise<MedicationResult> {
    const existing = await this.medicationRepository.findById(command.id);
    if (!existing) {
      throw new MedicationNotFoundException(command.id);
    }
    if (existing.userId !== command.userId) {
      throw new MedicationAccessDeniedException();
    }

    const updateData: {
      name?: string;
      dosage?: string;
      frequency?: string;
      startDate?: Date;
      endDate?: Date;
      notes?: string;
      isActive?: boolean;
    } = {};

    const historyEntries: Array<{
      medicationId: string;
      userId: string;
      changedField: string;
      oldValue: string | null;
      newValue: string | null;
    }> = [];

    if (command.name !== undefined) {
      if (command.name) MedicationName.create(command.name);
      if (command.name !== existing.name) {
        historyEntries.push({
          medicationId: command.id,
          userId: command.userId,
          changedField: 'name',
          oldValue: existing.name,
          newValue: command.name,
        });
      }
      updateData.name = command.name;
    }
    if (command.dosage !== undefined) {
      if (command.dosage) Dosage.create(command.dosage);
      if (command.dosage !== existing.dosage) {
        historyEntries.push({
          medicationId: command.id,
          userId: command.userId,
          changedField: 'dosage',
          oldValue: existing.dosage,
          newValue: command.dosage,
        });
      }
      updateData.dosage = command.dosage;
    }
    if (command.frequency !== undefined) {
      if (command.frequency) Frequency.create(command.frequency);
      if (command.frequency !== existing.frequency) {
        historyEntries.push({
          medicationId: command.id,
          userId: command.userId,
          changedField: 'frequency',
          oldValue: existing.frequency,
          newValue: command.frequency,
        });
      }
      updateData.frequency = command.frequency;
    }
    if (command.startDate !== undefined) {
      const newDate = command.startDate ? new Date(command.startDate) : undefined;
      if (newDate?.getTime() !== existing.startDate.getTime()) {
        historyEntries.push({
          medicationId: command.id,
          userId: command.userId,
          changedField: 'startDate',
          oldValue: existing.startDate.toISOString(),
          newValue: newDate?.toISOString() ?? null,
        });
      }
      updateData.startDate = newDate;
    }
    if (command.endDate !== undefined) {
      const newDate = command.endDate ? new Date(command.endDate) : null;
      const oldDate = existing.endDate?.toISOString() ?? null;
      if (newDate?.getTime() !== existing.endDate?.getTime()) {
        historyEntries.push({
          medicationId: command.id,
          userId: command.userId,
          changedField: 'endDate',
          oldValue: oldDate,
          newValue: newDate?.toISOString() ?? null,
        });
      }
      updateData.endDate = newDate;
    }
    if (command.notes !== undefined) {
      if (command.notes !== existing.notes) {
        historyEntries.push({
          medicationId: command.id,
          userId: command.userId,
          changedField: 'notes',
          oldValue: existing.notes,
          newValue: command.notes,
        });
      }
      updateData.notes = command.notes;
    }
    if (command.isActive !== undefined) {
      if (command.isActive !== existing.isActive) {
        historyEntries.push({
          medicationId: command.id,
          userId: command.userId,
          changedField: 'isActive',
          oldValue: String(existing.isActive),
          newValue: String(command.isActive),
        });
      }
      updateData.isActive = command.isActive;
    }

    const updated = await this.medicationRepository.update(command.id, updateData);

    if (historyEntries.length > 0) {
      await this.medicationRepository.recordHistoryEntries(historyEntries);
    }

    return this.toResult(updated);
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