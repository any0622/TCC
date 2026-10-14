import { Module } from '@nestjs/common';
import { AllergiesController } from './allergies.controller';
import { AllergiesService } from './allergies.service';
import { AllergiesRepository } from './repositories/allergies.repository';
import { PrismaAllergiesRepository } from './repositories/prisma-allergies.repository';

@Module({
  controllers: [AllergiesController],
  providers: [
    AllergiesService,
    { provide: AllergiesRepository, useClass: PrismaAllergiesRepository },
  ],
})
export class AllergiesModule {}
