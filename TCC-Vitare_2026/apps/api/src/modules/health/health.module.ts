import { Module } from '@nestjs/common';

import { HealthCheckUseCase } from './application/use-cases/health-check.use-case';
import { HealthController } from './presentation/controllers/health.controller';

@Module({
  controllers: [HealthController],
  providers: [HealthCheckUseCase],
  exports: [HealthCheckUseCase],
})
export class HealthModule {}