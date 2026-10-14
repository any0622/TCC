import { Module } from '@nestjs/common';

// Application Use Cases
import {
  CreateMedicationUseCase,
  UpdateMedicationUseCase,
  DeleteMedicationUseCase,
  GetActiveMedicationsUseCase,
  GetMedicationHistoryUseCase,
} from './application/use-cases';

// Application Ports
import { MedicationRepositoryPort, MEDICATION_REPOSITORY_PORT } from './application/ports';

// Infrastructure - Repositories
import { PrismaMedicationRepository } from './infrastructure/repositories/prisma-medication.repository';

// Presentation
import { MedicationsController } from './presentation/controllers/medications.controller';

@Module({
  controllers: [MedicationsController],
  providers: [
    // Use Cases
    CreateMedicationUseCase,
    UpdateMedicationUseCase,
    DeleteMedicationUseCase,
    GetActiveMedicationsUseCase,
    GetMedicationHistoryUseCase,

    // Repository Implementation
    { provide: MEDICATION_REPOSITORY_PORT, useClass: PrismaMedicationRepository },
  ],
  exports: [
    CreateMedicationUseCase,
    UpdateMedicationUseCase,
    DeleteMedicationUseCase,
    GetActiveMedicationsUseCase,
    GetMedicationHistoryUseCase,
  ],
})
export class MedicationsModule {}