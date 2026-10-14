import { Module } from '@nestjs/common';

import {
  RegisterStaffUseCase,
  LoginStaffUseCase,
  BootstrapAdminUseCase,
  GetStaffProfileUseCase,
} from './application/use-cases';

import { StaffRepositoryPort, STAFF_REPOSITORY_PORT, HashingServicePort, STAFF_HASHING_SERVICE_PORT, TokenGeneratorPort, STAFF_TOKEN_GENERATOR_PORT } from './application/ports';
import { PrismaStaffRepository } from './infrastructure/repositories/prisma-staff.repository';
import { StaffAuthController } from './presentation/controllers/staff-auth.controller';
import { StaffJwtAuthGuard } from './presentation/guards/staff-jwt-auth.guard';
import { StaffJwtStrategy } from './infrastructure/strategies/staff-jwt.strategy';
import { BcryptHashingService } from './infrastructure/services/bcrypt-hashing.service';
import { JwtTokenGenerator } from './infrastructure/services/jwt-token-generator.service';

@Module({
  controllers: [StaffAuthController],
  providers: [
    RegisterStaffUseCase,
    LoginStaffUseCase,
    BootstrapAdminUseCase,
    GetStaffProfileUseCase,
    { provide: STAFF_REPOSITORY_PORT, useClass: PrismaStaffRepository },
    { provide: STAFF_HASHING_SERVICE_PORT, useClass: BcryptHashingService },
    { provide: STAFF_TOKEN_GENERATOR_PORT, useClass: JwtTokenGenerator },
    StaffJwtAuthGuard,
    StaffJwtStrategy,
  ],
  exports: [
    RegisterStaffUseCase,
    LoginStaffUseCase,
    BootstrapAdminUseCase,
    GetStaffProfileUseCase,
  ],
})
export class StaffModule {}