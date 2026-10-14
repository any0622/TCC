import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { PatientsRepository } from './repositories/patients.repository';
import { PrismaPatientsRepository } from './repositories/prisma-patients.repository';

@Module({
  controllers: [PatientsController],
  providers: [
    PatientsService,
    { provide: PatientsRepository, useClass: PrismaPatientsRepository },
  ],
})
export class PatientsModule {}
