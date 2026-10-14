import { Injectable } from '@nestjs/common';
import type { UserRepository } from '../../domain/repositories';
import type { PasswordResetTokenRepository } from '../../domain/repositories';
import type { TokenGenerator, EmailService } from '../../domain/services';
import { HashingService } from '../../domain/services';
import { ForgotPasswordCommand } from '../dto/auth.dto';
import { Email } from '../../domain/value-objects';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly tokenGenerator: TokenGenerator,
    private readonly emailService: EmailService,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<void> {
    const email = Email.create(command.email);
    const user = await this.userRepository.findByEmail(email.getValue());
    if (!user) {
      return; // Don't reveal if user exists
    }

    const rawToken = this.tokenGenerator.generateRefreshToken();
    const tokenHash = this.tokenGenerator.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.passwordResetTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    await this.emailService.sendPasswordReset(user.email, rawToken);
  }
}