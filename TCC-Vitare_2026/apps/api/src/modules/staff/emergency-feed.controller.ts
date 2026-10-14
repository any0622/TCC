import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { StaffJwtAuthGuard } from './guards/staff-jwt-auth.guard';
import { EmergencyFeedRepository } from './repositories/emergency-feed.repository';

@Controller('staff/emergencies')
export class EmergencyFeedController {
  constructor(private readonly repository: EmergencyFeedRepository) {}

  @Public() // desliga o guard global de paciente — ver nota arquitetural no topo
  @UseGuards(StaffJwtAuthGuard)
  @Get()
  findRecent(@Query('limit') limit?: string) {
    const parsedLimit = limit ? Math.min(Number(limit), 100) : 50;
    return this.repository.findRecent(parsedLimit);
  }
}
