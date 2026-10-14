import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { HealthService, HealthResponse } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get('liveness')
  liveness() {
    return this.healthService.checkLiveness();
  }

  @Public()
  @Get('readiness')
  async readiness(@Res() res: Response) {
    const result: HealthResponse = await this.healthService.checkReadiness();
    const statusCode =
      result.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    return res.status(statusCode).json(result);
  }

  @Public()
  @Get('startup')
  startup() {
    return this.healthService.checkStartup();
  }

  @Public()
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
