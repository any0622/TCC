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
import * as currentUserDecorator from '../../common/decorators/current-user.decorator';
import { TriggerEmergencyDto } from './dto/trigger-emergency.dto';
import { EmergencyService } from './emergency.service';

@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @HttpCode(HttpStatus.CREATED)
  @Post('trigger')
  trigger(
    @currentUserDecorator.CurrentUser()
    user: currentUserDecorator.AuthenticatedUser,
    @Body() dto: TriggerEmergencyDto,
    @Headers('X-Idempotency-Key') idempotencyKey: string,
  ) {
    return this.emergencyService.trigger(user.id, dto, idempotencyKey);
  }

  @Get()
  findAll(
    @currentUserDecorator.CurrentUser()
    user: currentUserDecorator.AuthenticatedUser,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.emergencyService.findAllByUserWithCursor(user.id, {
      cursor,
      limit: parsedLimit,
    });
  }
}
