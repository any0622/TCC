import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from '../../infra/email/email.module';

// Domain
// (entities, value-objects, exceptions are plain classes, no providers needed)

// Application Use Cases
import {
  RegisterUserUseCase,
  LoginUserUseCase,
  RefreshTokenUseCase,
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
  ValidateGoogleUserUseCase,
  CompleteGoogleLoginUseCase,
} from './application/use-cases';

// Application Ports (interfaces)
import {
  UserRepositoryPort,
  USER_REPOSITORY_PORT,
  RefreshTokenRepositoryPort,
  REFRESH_TOKEN_REPOSITORY_PORT,
  PasswordResetTokenRepositoryPort,
  PASSWORD_RESET_TOKEN_REPOSITORY_PORT,
  HashingServicePort,
  HASHING_SERVICE_PORT,
  TokenGeneratorPort,
  TOKEN_GENERATOR_PORT,
  EmailServicePort,
  EMAIL_SERVICE_PORT,
} from './application/ports';

// Infrastructure - Repositories
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { PrismaRefreshTokenRepository } from './infrastructure/repositories/prisma-refresh-token.repository';
import { PrismaPasswordResetTokenRepository } from './infrastructure/repositories/prisma-password-reset-token.repository';

// Infrastructure - Services
import { BcryptHashingService } from './infrastructure/services/bcrypt-hashing.service';
import { JwtTokenGenerator } from './infrastructure/services/jwt-token-generator.service';
import { ResendEmailService } from './infrastructure/services/resend-email.service';

// Infrastructure - Strategies
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { GoogleStrategy } from './infrastructure/strategies/google.strategy';

// Presentation
import { AuthController } from './presentation/controllers/auth.controller';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { GoogleAuthGuard } from './presentation/guards/google-auth.guard';
import { LocalAuthGuard } from './presentation/guards/local-auth.guard';

@Module({
  imports: [
    PassportModule,
    EmailModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.get<string>(
            'JWT_ACCESS_EXPIRES_IN',
          ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Use Cases
    RegisterUserUseCase,
    LoginUserUseCase,
    RefreshTokenUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    ValidateGoogleUserUseCase,
    CompleteGoogleLoginUseCase,

    // Repository Implementations
    { provide: USER_REPOSITORY_PORT, useClass: PrismaUserRepository },
    { provide: REFRESH_TOKEN_REPOSITORY_PORT, useClass: PrismaRefreshTokenRepository },
    { provide: PASSWORD_RESET_TOKEN_REPOSITORY_PORT, useClass: PrismaPasswordResetTokenRepository },

    // Service Implementations
    { provide: HASHING_SERVICE_PORT, useClass: BcryptHashingService },
    { provide: TOKEN_GENERATOR_PORT, useClass: JwtTokenGenerator },
    { provide: EMAIL_SERVICE_PORT, useClass: ResendEmailService },

    // Strategies
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,

    // Guards
    JwtAuthGuard,
    GoogleAuthGuard,
    LocalAuthGuard,
  ],
  exports: [
    RegisterUserUseCase,
    LoginUserUseCase,
    RefreshTokenUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    ValidateGoogleUserUseCase,
    CompleteGoogleLoginUseCase,
  ],
})
export class AuthModule {}