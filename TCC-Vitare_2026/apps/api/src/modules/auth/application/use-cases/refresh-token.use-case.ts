import { Injectable } from '@nestjs/common';
import type { UserRepository } from '../../domain/repositories';
import type { RefreshTokenRepository } from '../../domain/repositories';
import type { TokenGenerator } from '../../domain/services';
import { RefreshTokenCommand, TokenPairResult } from '../dto';
import { User } from '../../domain/entities/user.entity';
import { InvalidRefreshTokenException, RefreshTokenReusedException, UserNotFoundException } from '../../domain/exceptions';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<TokenPairResult> {
    const tokenHash = this.tokenGenerator.hashToken(command.refreshToken);
    const stored = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new InvalidRefreshTokenException();
    }

    const user = await this.userRepository.findById(stored.userId);
    if (!user) {
      throw new UserNotFoundException(stored.userId);
    }

    await this.refreshTokenRepository.revokeByTokenHash(tokenHash);
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