import { Module } from '@nestjs/common';

import {
  CreateForbiddenMedicationUseCase,
  RemoveForbiddenMedicationUseCase,
  GetForbiddenMedicationsUseCase,
} from './application/use-cases';

import { ForbiddenMedicationRepositoryPort } from './application/ports';
import { PrismaForbiddenMedicationRepository } from './infrastructure/repositories/prisma-forbidden-medication.repository';
import { ForbiddenMedicationsController } from './presentation/controllers/forbidden-medications.controller';

@Module({
  controllers: [ForbiddenMedicationsController],
  providers: [
    CreateForbiddenMedicationUseCase,
    RemoveForbiddenMedicationUseCase,
    GetForbiddenMedicationsUseCase,
    { provide: ForbiddenMedicationRepositoryPort, useClass: PrismaForbiddenMedicationRepository },
  ],
  exports: [
    CreateForbiddenMedicationUseCase,
    RemoveForbiddenMedicationUseCase,
    GetForbiddenMedicationsUseCase,
  ],
})
export class ForbiddenMedicationsModule {}