import { Module } from '@nestjs/common';
import { IdempotencyModule } from '../../infra/idempotency/idempotency.module';
import { OutboxModule } from '../../infra/outbox/outbox.module';

import {
  TriggerEmergencyUseCase,
  GetEmergenciesUseCase,
  GetEmergenciesWithCursorUseCase,
} from './application/use-cases';

import { EmergencyRepositoryPort, EMERGENCY_REPOSITORY_PORT } from './application/ports';
import { PrismaEmergencyRepository } from './infrastructure/repositories/prisma-emergency.repository';
import { EmergencyController } from './presentation/controllers/emergency.controller';
import { EmergencyGateway } from './emergency.gateway';

@Module({
  imports: [IdempotencyModule, OutboxModule],
  controllers: [EmergencyController],
  providers: [
    TriggerEmergencyUseCase,
    GetEmergenciesUseCase,
    GetEmergenciesWithCursorUseCase,
    { provide: EMERGENCY_REPOSITORY_PORT, useClass: PrismaEmergencyRepository },
    EmergencyGateway,
  ],
  exports: [EmergencyGateway],
})
export class EmergencyModule {}