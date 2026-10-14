import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthRepository } from './repositories/auth.repository';
import { EmailService } from '../../infra/email/email.service';
import { beforeEach, describe, it } from 'node:test';

void describe('AuthService', () => {
  let service: AuthService;

  const mockAuthRepository = {
    findByEmail: jest.fn(),
    findByGoogleId: jest.fn(),
    findById: jest.fn(),
    createLocalUser: jest.fn(),
    createGoogleUser: jest.fn(),
    updatePassword: jest.fn(),
    storeRefreshToken: jest.fn(),
    findRefreshToken: jest.fn(),
    revokeRefreshToken: jest.fn(),
    revokeAllRefreshTokens: jest.fn(),
    createPasswordResetToken: jest.fn(),
    findPasswordResetToken: jest.fn(),
    markPasswordResetTokenUsed: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_ACCESS_SECRET') return 'test-secret';
      if (key === 'JWT_ACCESS_EXPIRES_IN') return '15m';
      if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
      return undefined;
    }),
  };

  const mockEmailService = {
    sendWelcome: jest.fn(),
    sendPasswordReset: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  void it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
