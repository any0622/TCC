// src/modules/forbidden-medications/forbidden-medications.module.ts
import { Module } from '@nestjs/common';
import { ForbiddenMedicationsController } from './forbidden-medications.controller';
import { ForbiddenMedicationsService } from './forbidden-medications.service';
import { ForbiddenMedicationsRepository } from './repositories/forbidden-medications.repository';
import { PrismaForbiddenMedicationsRepository } from './repositories/prisma-forbidden-medications.repository';

@Module({
  controllers: [ForbiddenMedicationsController],
  providers: [
    ForbiddenMedicationsService,
    {
      provide: ForbiddenMedicationsRepository,
      useClass: PrismaForbiddenMedicationsRepository,
    },
  ],
})
export class ForbiddenMedicationsModule {}
