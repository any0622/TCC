import { Module } from '@nestjs/common';

import {
  CreateConditionUseCase,
  RemoveConditionUseCase,
  GetConditionsUseCase,
} from './application/use-cases';

import { ConditionRepositoryPort } from './application/ports';
import { PrismaConditionRepository } from './infrastructure/repositories/prisma-condition.repository';
import { ConditionsController } from './presentation/controllers/conditions.controller';

@Module({
  controllers: [ConditionsController],
  providers: [
    CreateConditionUseCase,
    RemoveConditionUseCase,
    GetConditionsUseCase,
    { provide: ConditionRepositoryPort, useClass: PrismaConditionRepository },
  ],
  exports: [
    CreateConditionUseCase,
    RemoveConditionUseCase,
    GetConditionsUseCase,
  ],
})
export class ConditionsModule {}