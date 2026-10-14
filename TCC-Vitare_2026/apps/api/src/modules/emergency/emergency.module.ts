import { Module } from '@nestjs/common';
import { IdempotencyModule } from '../../infra/idempotency/idempotency.module';
import { OutboxModule } from '../../infra/outbox/outbox.module';
import { EmergencyController } from './emergency.controller';
import { EmergencyService } from './emergency.service';
import { EmergencyGateway } from './emergency.gateway';
import { EmergencyRepository } from './repositories/emergency.repository';
import { PrismaEmergencyRepository } from './repositories/prisma-emergency.repository';

@Module({
  imports: [IdempotencyModule, OutboxModule],
  controllers: [EmergencyController],
  providers: [
    EmergencyService,
    EmergencyGateway,
    { provide: EmergencyRepository, useClass: PrismaEmergencyRepository },
  ],
  exports: [EmergencyGateway],
})
export class EmergencyModule {}
