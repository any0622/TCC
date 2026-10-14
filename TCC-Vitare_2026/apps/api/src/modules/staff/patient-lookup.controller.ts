import {
  Controller,
  Get,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { StaffJwtAuthGuard } from './guards/staff-jwt-auth.guard';
import { LookupPatientQueryDto } from './dto/lookup-patient-query.dto';
import { PatientLookupRepository } from './repositories/patient-lookup.repository';

@Controller('staff/patients')
export class PatientLookupController {
  constructor(private readonly repository: PatientLookupRepository) {}

  @Public()
  @UseGuards(StaffJwtAuthGuard)
  @Get()
  async lookup(@Query() query: LookupPatientQueryDto) {
    const profile = await this.repository.findFullProfileByCpf(query.cpf);
    if (!profile)
      throw new NotFoundException('Nenhum paciente encontrado com este CPF');
    return profile;
  }
}
