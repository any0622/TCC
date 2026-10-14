import { Module } from '@nestjs/common';

// Application Use Cases
import {
  GetPatientProfileUseCase,
  UpdatePatientProfileUseCase,
  DeletePatientAccountUseCase,
} from './application/use-cases';

// Application Ports
import { PatientRepositoryPort } from './application/ports';

// Infrastructure - Repositories
import { PrismaPatientRepository } from './infrastructure/repositories/prisma-patient.repository';

// Presentation
import { PatientsController } from './presentation/controllers/patients.controller';

@Module({
  controllers: [PatientsController],
  providers: [
    // Use Cases
    GetPatientProfileUseCase,
    UpdatePatientProfileUseCase,
    DeletePatientAccountUseCase,

    // Repository Implementation
    { provide: PatientRepositoryPort, useClass: PrismaPatientRepository },
  ],
  exports: [
    GetPatientProfileUseCase,
    UpdatePatientProfileUseCase,
    DeletePatientAccountUseCase,
  ],
})
export class PatientsModule {}