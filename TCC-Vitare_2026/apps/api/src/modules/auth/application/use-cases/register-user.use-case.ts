import { Injectable } from '@nestjs/common';
import type { UserRepository } from '../../domain/repositories';
import { RefreshTokenRepository } from '../../domain/repositories';
import type { HashingService, TokenGenerator, EmailService } from '../../domain/services';
import {
  RegisterUserCommand,
  TokenPairResult,
} from '../dto/auth.dto';
import { User } from '../../domain/entities/user.entity';
import { Email, CPF } from '../../domain/value-objects';
import { UserAlreadyExistsException, AuthDomainException } from '../../domain/exceptions';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: HashingService,
    private readonly tokenGenerator: TokenGenerator,
    private readonly emailService: EmailService,
  ) {}

  async execute(command: RegisterUserCommand): Promise<TokenPairResult> {
    const email = Email.create(command.email);
    const existingUser = await this.userRepository.findByEmail(email.getValue());
    if (existingUser) {
      throw new UserAlreadyExistsException(email.getValue());
    }

    const passwordHash = await this.hashingService.hash(command.password);
    const user = User.create({
      fullName: command.fullName,
      email: email.getValue(),
      passwordHash,
      googleId: null,
      avatarUrl: null,
      cpf: null,
      phone: null,
      address: null,
      birthDate: null,
      bloodType: null,
      weightKg: null,
      heightCm: null,
    });

    const savedUser = await this.userRepository.save(user);
    await this.emailService.sendWelcome(savedUser.email, savedUser.fullName);

    return this.generateTokenPair(savedUser);
  }

  private generateTokenPair(user: User): TokenPairResult {
    const accessToken = this.tokenGenerator.generateAccessToken(
      { sub: user.id, email: user.email },
      '15m',
    );
    const refreshToken = this.tokenGenerator.generateRefreshToken();
    const refreshTokenHash = this.tokenGenerator.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

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