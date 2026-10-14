import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './infra/prisma/prisma.module';
import { RedisModule } from './infra/redis/redis.module';
import { CacheModule } from './infra/cache/cache.module';
import { IdempotencyModule } from './infra/idempotency/idempotency.module';
import { OutboxModule } from './infra/outbox/outbox.module';
import { AuthModule } from './modules/auth/auth.module';
import { PatientsModule } from './modules/patients/patients.module';
import { ConditionsModule } from './modules/conditions/conditions.module';
import { MedicationsModule } from './modules/medications/medications.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { EmergencyModule } from './modules/emergency/emergency.module';
import { HealthModule } from './modules/health/health.module';
import { DiseaseDictionaryModule } from './modules/disease-dictionary/disease-dictionary.module';
import { MedicationsDictionaryModule } from './modules/medications-dictionary/medications-dictionary.module';
import { AllergiesModule } from './modules/allergies/allergies.module';
import { ForbiddenMedicationsModule } from './modules/forbidden-medications/forbidden-medications.module';
import { StaffModule } from './modules/staff/staff.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    RedisModule,
    CacheModule,
    IdempotencyModule,
    OutboxModule,
    AuthModule,
    PatientsModule,
    ConditionsModule,
    MedicationsModule,
    ContactsModule,
    EmergencyModule,
    HealthModule,
    DiseaseDictionaryModule,
    MedicationsDictionaryModule,
    AllergiesModule,
    ForbiddenMedicationsModule,
    StaffModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
  ],
})
export class AppModule {}
