import { Injectable } from '@nestjs/common';
import type { AllergyRepositoryPort } from '../ports';
import { CreateAllergyCommand, AllergyResult } from '../dto/allergy.dto';
import { Allergy, AllergyName } from '../../domain/entities/allergy.entity';
import { InvalidAllergyDataException } from '../../domain/exceptions';

@Injectable()
export class CreateAllergyUseCase {
  constructor(private readonly allergyRepository: AllergyRepositoryPort) {}

  async execute(command: CreateAllergyCommand): Promise<AllergyResult> {
    const name = AllergyName.create(command.name);

    const allergy = Allergy.create({
      userId: command.userId,
      name: name.getValue(),
      severity: command.severity ?? null,
      notes: command.notes ?? null,
    });

    const saved = await this.allergyRepository.save(allergy);
    return this.toResult(saved);
  }

  private toResult(allergy: Allergy): AllergyResult {
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