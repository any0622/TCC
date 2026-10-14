import { Module } from '@nestjs/common';
import { CacheModule } from '../../infra/cache/cache.module';
import { DiseaseDictionaryController } from './disease-dictionary.controller';
import { DiseaseDictionaryService } from './disease-dictionary.service';
import { DiseaseDictionaryRepository } from './repositories/disease-dictionary.repository';
import { PrismaDiseaseDictionaryRepository } from './repositories/prisma-disease-dictionary.repository';

@Module({
  imports: [CacheModule],
  controllers: [DiseaseDictionaryController],
  providers: [
    DiseaseDictionaryService,
    {
      provide: DiseaseDictionaryRepository,
      useClass: PrismaDiseaseDictionaryRepository,
    },
  ],
})
export class DiseaseDictionaryModule {}
