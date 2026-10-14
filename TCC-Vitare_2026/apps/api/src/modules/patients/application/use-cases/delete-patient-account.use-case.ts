import { Injectable } from '@nestjs/common';
import type { PatientRepositoryPort } from '../ports';
import { DeletePatientAccountCommand } from '../dto/patient.dto';
import { PatientNotFoundException } from '../../domain/exceptions';

@Injectable()
export class DeletePatientAccountUseCase {
  constructor(private readonly patientRepository: PatientRepositoryPort) {}

  async execute(command: DeletePatientAccountCommand): Promise<void> {
    const profile = await this.patientRepository.findById(command.userId);
    if (!profile) {
      throw new PatientNotFoundException(command.userId);
    }
    await this.patientRepository.remove(command.userId);
  }
}