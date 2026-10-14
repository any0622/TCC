import { Injectable } from '@nestjs/common';
import type { UserRepository } from '../../domain/repositories';
import type { RefreshTokenRepository } from '../../domain/repositories';
import type { HashingService, TokenGenerator } from '../../domain/services';
import { LoginCommand, TokenPairResult } from '../dto';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects';
import { InvalidCredentialsException, UserNotFoundException } from '../../domain/exceptions';

@Injectable()
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly hashingService: HashingService,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(command: LoginCommand): Promise<TokenPairResult> {
    const email = Email.create(command.email);
    const user = await this.userRepository.findByEmail(email.getValue());
    if (!user || !user.passwordHash) {
      throw new InvalidCredentialsException();
    }

    const isValid = await this.hashingService.verify(command.password, user.passwordHash);
    if (!isValid) {
      throw new InvalidCredentialsException();
    }

    await this.refreshTokenRepository.revokeAllByUserId(user.id);
    return this.generateTokenPair(user);
  }

  private generateTokenPair(user: User): TokenPairResult {
    const accessToken = this.tokenGenerator.generateAccessToken(
      { sub: user.id, email: user.email },
      '15m',
    );
    const refreshToken = this.tokenGenerator.generateRefreshToken();
    const refreshTokenHash = this.tokenGenerator.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

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