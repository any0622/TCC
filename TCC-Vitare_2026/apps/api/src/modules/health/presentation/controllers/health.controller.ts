import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../../../../common/decorators/public.decorator';
import type { HealthCheckUseCase } from '../../application/use-cases/health-check.use-case';
import { HealthCheckResponseDto, HealthReadinessResponseDto } from './presentation/dto/health.dto';

@Controller('health')
export class HealthController {
  constructor(private readonly healthCheckUseCase: HealthCheckUseCase) {}

  @Public()
  @Get('liveness')
  async liveness(): Promise<HealthCheckResponseDto> {
    return this.healthCheckUseCase.checkLiveness();
  }

  @Public()
  @Get('readiness')
  async readiness(@Res() res: Response): Promise<void> {
    const result: HealthReadinessResponseDto = await this.healthCheckUseCase.checkReadiness();
    const statusCode = result.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    res.status(statusCode).json(result);
  }

  @Public()
  @Get('startup')
  async startup(): Promise<HealthCheckResponseDto> {
    return this.healthCheckUseCase.checkStartup();
  }

  @Public()
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}