import { Module } from '@nestjs/common';

import {
  RegisterStaffUseCase,
  LoginStaffUseCase,
  BootstrapAdminUseCase,
  GetStaffProfileUseCase,
} from './application/use-cases';

import { StaffRepositoryPort, HashingServicePort, TokenGeneratorPort } from './application/ports';
import { PrismaStaffRepository } from './infrastructure/repositories/prisma-staff.repository';
import { StaffAuthController } from './presentation/controllers/staff-auth.controller';
import { StaffJwtAuthGuard } from '../guards/staff-jwt-auth.guard';
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
    { provide: StaffRepositoryPort, useClass: PrismaStaffRepository },
    { provide: HashingServicePort, useClass: BcryptHashingService },
    { provide: TokenGeneratorPort, useClass: JwtTokenGenerator },
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