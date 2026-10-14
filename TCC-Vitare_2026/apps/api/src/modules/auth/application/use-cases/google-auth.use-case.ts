import { Injectable } from '@nestjs/common';
import type { UserRepository } from '../../domain/repositories';
import type { RefreshTokenRepository } from '../../domain/repositories';
import type { TokenGenerator } from '../../domain/services';
import { GoogleAuthCommand, TokenPairResult } from '../dto/auth.dto';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects';

interface GoogleProfile {
  googleId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

@Injectable()
export class ValidateGoogleUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(profile: GoogleProfile): Promise<User> {
    const email = Email.create(profile.email);
    let user = await this.userRepository.findByGoogleId(profile.googleId);
    if (user) {
      return user;
    }

    user = await this.userRepository.findByEmail(email.getValue());
    if (user) {
      throw new Error('Email já cadastrado com outro provedor');
    }

    user = User.create({
      fullName: profile.fullName,
      email: email.getValue(),
      passwordHash: null,
      googleId: profile.googleId,
      avatarUrl: profile.avatarUrl ?? null,
      cpf: null,
      phone: null,
      address: null,
      birthDate: null,
      bloodType: null,
      weightKg: null,
      heightCm: null,
    });

    return this.userRepository.save(user);
  }
}

@Injectable()
export class CompleteGoogleLoginUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(user: User): Promise<TokenPairResult> {
    await this.refreshTokenRepository.revokeAllByUserId(user.id);

    const accessToken = this.tokenGenerator.generateAccessToken(
      { sub: user.id, email: user.email },
      '15m',
    );
    const refreshToken = this.tokenGenerator.generateRefreshToken();
    const refreshTokenHash = this.tokenGenerator.hashToken(refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
    };
  }
}