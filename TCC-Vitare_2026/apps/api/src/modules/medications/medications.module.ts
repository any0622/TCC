import { Module } from '@nestjs/common';
import { MedicationsController } from './medications.controller';
import { MedicationsService } from './medications.service';
import { MedicationsRepository } from './repositories/medications.repository';
import { PrismaMedicationsRepository } from './repositories/prisma-medications.repository';

@Module({
  controllers: [MedicationsController],
  providers: [
    MedicationsService,
    { provide: MedicationsRepository, useClass: PrismaMedicationsRepository },
  ],
})
export class MedicationsModule {}
