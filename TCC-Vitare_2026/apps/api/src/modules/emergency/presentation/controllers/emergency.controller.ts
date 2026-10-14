import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../common/decorators/current-user.decorator';
import {
  TriggerEmergencyRequestDto,
  EmergencyResponseDto,
  CursorPaginatedEmergencyResponseDto,
} from './presentation/dto/emergency.dto';
import {
  TriggerEmergencyUseCase,
  GetEmergenciesUseCase,
  GetEmergenciesWithCursorUseCase,
} from '../../application/use-cases';

@Controller('emergency')
export class EmergencyController {
  constructor(
    private readonly triggerUseCase: TriggerEmergencyUseCase,
    private readonly getAllUseCase: GetEmergenciesUseCase,
    private readonly getWithCursorUseCase: GetEmergenciesWithCursorUseCase,
  ) {}

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @HttpCode(HttpStatus.CREATED)
  @Post('trigger')
  async trigger(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: TriggerEmergencyRequestDto,
    @Headers('X-Idempotency-Key') idempotencyKey: string,
  ): Promise<EmergencyResponseDto> {
    return this.triggerUseCase.execute({
      userId: user.id,
      latitude: dto.latitude,
      longitude: dto.longitude,
      idempotencyKey,
    });
  }

  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ): Promise<EmergencyResponseDto[] | CursorPaginatedEmergencyResponseDto> {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    if (cursor) {
      return this.getWithCursorUseCase.execute({
        userId: user.id,
        cursor,
        limit: parsedLimit,
      });
    }
    return this.getAllUseCase.execute({ userId: user.id });
  }
}