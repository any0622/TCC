import { Module } from '@nestjs/common';
import { CacheModule } from '../../infra/cache/cache.module';
import { MedicationsDictionaryController } from './medications-dictionary.controller';
import { MedicationsDictionaryService } from './medications-dictionary.service';
import { MedicationsDictionaryRepository } from './repositories/medications-dictionary.repository';
import { PrismaMedicationsDictionaryRepository } from './repositories/prisma-medications-dictionary.repository';

@Module({
  imports: [CacheModule],
  controllers: [MedicationsDictionaryController],
  providers: [
    MedicationsDictionaryService,
    {
      provide: MedicationsDictionaryRepository,
      useClass: PrismaMedicationsDictionaryRepository,
    },
  ],
})
export class MedicationsDictionaryModule {}
