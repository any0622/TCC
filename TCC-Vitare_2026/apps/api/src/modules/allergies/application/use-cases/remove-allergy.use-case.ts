import { Injectable } from '@nestjs/common';
import type { AllergyRepositoryPort } from '../ports';
import { RemoveAllergyCommand } from '../dto/allergy.dto';
import { AllergyNotFoundException, AllergyAccessDeniedException } from '../../domain/exceptions';

@Injectable()
export class RemoveAllergyUseCase {
  constructor(private readonly allergyRepository: AllergyRepositoryPort) {}

  async execute(command: RemoveAllergyCommand): Promise<void> {
    const existing = await this.allergyRepository.findById(command.id);
    if (!existing) {
      throw new AllergyNotFoundException(command.id);
    }
    if (existing.userId !== command.userId) {
      throw new AllergyAccessDeniedException();
    }
    await this.allergyRepository.remove(command.id);
  }
}