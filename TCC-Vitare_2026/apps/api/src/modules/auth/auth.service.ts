/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../../generated/prisma/client';
import ms from 'ms';
import { EmailService } from '../../infra/email/email.service';
import {
  generateOpaqueToken,
  hashPassword,
  sha256,
  verifyPassword,
} from '../../common/utils/hash.util';
import { AuthRepository } from './repositories/auth.repository';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface GoogleProfile {
  googleId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  async register(
    fullName: string,
    email: string,
    password: string,
  ): Promise<TokenPair> {
    const existing = await this.authRepository.findByEmail(email);
    if (existing) throw new UnauthorizedException('E-mail já cadastrado');

    const passwordHash = await hashPassword(password);
    const user = await this.authRepository.createLocalUser({
      fullName,
      email,
      passwordHash,
    });

    void this.emailService.sendWelcome(user.email, user.fullName);

    return this.issueTokenPair(user);
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.authRepository.findByEmail(email);
    if (!user?.passwordHash) return null;
    const isValid = await verifyPassword(password, user.passwordHash);
    return isValid ? user : null;
  }

  async login(user: User): Promise<TokenPair> {
    return this.issueTokenPair(user);
  }

  async validateGoogleUser(profile: GoogleProfile): Promise<User> {
    const existing = await this.authRepository.findByGoogleId(profile.googleId);
    if (existing) return existing;

    return this.authRepository.createGoogleUser({
      fullName: profile.fullName,
      email: profile.email,
      googleId: profile.googleId,
      avatarUrl: profile.avatarUrl,
    });
  }

  async refreshTokens(rawToken: string): Promise<TokenPair> {
    const tokenHash = sha256(rawToken);
    const stored = await this.authRepository.findRefreshToken(tokenHash);

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    const user = await this.authRepository.findById(stored.userId);
    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    await this.authRepository.revokeRefreshToken(tokenHash);
    return this.issueTokenPair(user);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.authRepository.findByEmail(email);
    if (!user) return;

    const rawToken = generateOpaqueToken();
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.authRepository.createPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });
    await this.emailService.sendPasswordReset(user.email, rawToken);
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = sha256(rawToken);
    const stored = await this.authRepository.findPasswordResetToken(tokenHash);

    if (!stored) throw new UnauthorizedException('Link inválido');
    if (stored.usedAt) throw new UnauthorizedException('Link já utilizado');
    if (stored.expiresAt < new Date())
      throw new UnauthorizedException('Link expirado');

    const passwordHash = await hashPassword(newPassword);

    await Promise.all([
      this.authRepository.updatePassword(stored.userId, passwordHash),
      this.authRepository.markPasswordResetTokenUsed(tokenHash),
      this.authRepository.revokeAllRefreshTokens(stored.userId),
    ]);
  }

  private async issueTokenPair(user: User): Promise<TokenPair> {
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>(
          'JWT_ACCESS_EXPIRES_IN',
        ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
      },
    );

    const rawRefreshToken = generateOpaqueToken();
    const refreshExpiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES_IN')!;
    const expiresAt = new Date(Date.now() + ms(refreshExpiresIn));

    await this.authRepository.storeRefreshToken({
      userId: user.id,
      tokenHash: sha256(rawRefreshToken),
      expiresAt,
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }
}
