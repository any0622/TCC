import { Module } from '@nestjs/common';
import { CacheModule } from '../../infra/cache/cache.module';

import {
  SearchMedicationsUseCase,
  FindMedicationByIdUseCase,
} from './application/use-cases';

import { MedicationsDictionaryRepositoryPort, MEDICATIONS_DICTIONARY_REPOSITORY_PORT } from './application/ports';
import { PrismaMedicationsDictionaryRepository } from './infrastructure/repositories/prisma-medications-dictionary.repository';
import { MedicationsDictionaryController } from './presentation/controllers/medications-dictionary.controller';

@Module({
  imports: [CacheModule],
  controllers: [MedicationsDictionaryController],
  providers: [
    SearchMedicationsUseCase,
    FindMedicationByIdUseCase,
    { provide: MEDICATIONS_DICTIONARY_REPOSITORY_PORT, useClass: PrismaMedicationsDictionaryRepository },
  ],
  exports: [
    SearchMedicationsUseCase,
    FindMedicationByIdUseCase,
  ],
})
export class MedicationsDictionaryModule {}