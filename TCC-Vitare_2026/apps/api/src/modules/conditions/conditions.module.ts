import { Module } from '@nestjs/common';
import { ConditionsController } from './conditions.controller';
import { ConditionsService } from './conditions.service';
import { ConditionsRepository } from './repositories/conditions.repository';
import { PrismaConditionsRepository } from './repositories/prisma-conditions.repository';

@Module({
  controllers: [ConditionsController],
  providers: [
    ConditionsService,
    { provide: ConditionsRepository, useClass: PrismaConditionsRepository },
  ],
})
export class ConditionsModule {}
