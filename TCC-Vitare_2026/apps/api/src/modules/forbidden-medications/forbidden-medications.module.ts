import { Module } from '@nestjs/common';

import {
  CreateForbiddenMedicationUseCase,
  RemoveForbiddenMedicationUseCase,
  GetForbiddenMedicationsUseCase,
} from './application/use-cases';

import { ForbiddenMedicationRepositoryPort, FORBIDDEN_MEDICATION_REPOSITORY_PORT } from './application/ports';
import { PrismaForbiddenMedicationRepository } from './infrastructure/repositories/prisma-forbidden-medication.repository';
import { ForbiddenMedicationsController } from './presentation/controllers/forbidden-medications.controller';

@Module({
  controllers: [ForbiddenMedicationsController],
  providers: [
    CreateForbiddenMedicationUseCase,
    RemoveForbiddenMedicationUseCase,
    GetForbiddenMedicationsUseCase,
    { provide: FORBIDDEN_MEDICATION_REPOSITORY_PORT, useClass: PrismaForbiddenMedicationRepository },
  ],
  exports: [
    CreateForbiddenMedicationUseCase,
    RemoveForbiddenMedicationUseCase,
    GetForbiddenMedicationsUseCase,
  ],
})
export class ForbiddenMedicationsModule {}