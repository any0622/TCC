import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { StaffAuthController } from './staff-auth.controller';
import { StaffAuthService } from './staff-auth.service';
import { EmergencyFeedController } from './emergency-feed.controller';
import { PatientLookupController } from './patient-lookup.controller';
import { StaffJwtStrategy } from './strategies/staff-jwt.strategy';
import { StaffRepository } from './repositories/staff.repository';
import { PrismaStaffRepository } from './repositories/prisma-staff.repository';
import { EmergencyFeedRepository } from './repositories/emergency-feed.repository';
import { PrismaEmergencyFeedRepository } from './repositories/prisma-emergency-feed.repository';
import { PatientLookupRepository } from './repositories/patient-lookup.repository';
import { PrismaPatientLookupRepository } from './repositories/prisma-patient-lookup.repository';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('STAFF_JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>(
            'STAFF_JWT_EXPIRES_IN',
          ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      }),
    }),
  ],
  controllers: [
    StaffAuthController,
    EmergencyFeedController,
    PatientLookupController,
  ],
  providers: [
    StaffAuthService,
    StaffJwtStrategy,
    { provide: StaffRepository, useClass: PrismaStaffRepository },
    {
      provide: EmergencyFeedRepository,
      useClass: PrismaEmergencyFeedRepository,
    },
    {
      provide: PatientLookupRepository,
      useClass: PrismaPatientLookupRepository,
    },
  ],
})
export class StaffModule {}
