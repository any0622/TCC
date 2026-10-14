import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from '../../infra/email/email.module';
import { AuthController } from './auth.controller';
import { GoogleAuthSessionService } from './google-auth-session.service';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthRepository } from './repositories/auth.repository';
import { PrismaAuthRepository } from './repositories/prisma-auth.repository';

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
    AuthService,
    GoogleAuthSessionService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    { provide: AuthRepository, useClass: PrismaAuthRepository },
  ],
  exports: [AuthService],
})
export class AuthModule {}
