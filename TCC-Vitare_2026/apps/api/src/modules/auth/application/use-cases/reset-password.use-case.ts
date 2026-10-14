import { Injectable } from '@nestjs/common';
import type { UserRepository } from '../../domain/repositories';
import type { PasswordResetTokenRepository } from '../../domain/repositories';
import type { RefreshTokenRepository } from '../../domain/repositories';
import type { HashingService, TokenGenerator } from '../../domain/services';
import { ResetPasswordCommand } from '../dto/auth.dto';
import { InvalidPasswordResetTokenException, UserNotFoundException } from '../../domain/exceptions';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly hashingService: HashingService,
    private readonly tokenGenerator: TokenGenerator,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<void> {
    const tokenHash = this.tokenGenerator.hashToken(command.token);
    const stored = await this.passwordResetTokenRepository.findByTokenHash(tokenHash);

    if (!stored) {
      throw new InvalidPasswordResetTokenException('Link inválido');
    }
    if (stored.usedAt) {
      throw new InvalidPasswordResetTokenException('Link já utilizado');
    }
    if (stored.expiresAt < new Date()) {
      throw new InvalidPasswordResetTokenException('Link expirado');
    }

    const passwordHash = await this.hashingService.hash(command.newPassword);

    await Promise.all([
      this.userRepository.updatePassword(stored.userId, passwordHash),
      this.passwordResetTokenRepository.markAsUsed(tokenHash),
      this.refreshTokenRepository.revokeAllByUserId(stored.userId),
    ]);
  }
}