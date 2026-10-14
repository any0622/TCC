import { Module } from '@nestjs/common';
import { CacheModule } from '../../../infra/cache/cache.module';

import {
  SearchDiseasesUseCase,
  FindDiseaseByIdUseCase,
} from './application/use-cases';

import { DiseaseDictionaryRepositoryPort } from './application/ports';
import { PrismaDiseaseDictionaryRepository } from './infrastructure/repositories/prisma-disease-dictionary.repository';
import { DiseaseDictionaryController } from './presentation/controllers/disease-dictionary.controller';

@Module({
  imports: [CacheModule],
  controllers: [DiseaseDictionaryController],
  providers: [
    SearchDiseasesUseCase,
    FindDiseaseByIdUseCase,
    { provide: DiseaseDictionaryRepositoryPort, useClass: PrismaDiseaseDictionaryRepository },
  ],
  exports: [
    SearchDiseasesUseCase,
    FindDiseaseByIdUseCase,
  ],
})
export class DiseaseDictionaryModule {}