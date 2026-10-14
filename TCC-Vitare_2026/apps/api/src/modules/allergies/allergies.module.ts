import { Module } from '@nestjs/common';

// Application Use Cases
import {
  CreateAllergyUseCase,
  RemoveAllergyUseCase,
  GetAllergiesUseCase,
} from './application/use-cases';

// Application Ports
import { AllergyRepositoryPort, ALLERGY_REPOSITORY_PORT } from './application/ports';

// Infrastructure - Repositories
import { PrismaAllergyRepository } from './infrastructure/repositories/prisma-allergy.repository';

// Presentation
import { AllergiesController } from './presentation/controllers/allergies.controller';

@Module({
  controllers: [AllergiesController],
  providers: [
    CreateAllergyUseCase,
    RemoveAllergyUseCase,
    GetAllergiesUseCase,
    { provide: ALLERGY_REPOSITORY_PORT, useClass: PrismaAllergyRepository },
  ],
  exports: [
    CreateAllergyUseCase,
    RemoveAllergyUseCase,
    GetAllergiesUseCase,
  ],
})
export class AllergiesModule {}