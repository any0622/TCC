export const USER_REPOSITORY_PORT = 'USER_REPOSITORY_PORT';
export const REFRESH_TOKEN_REPOSITORY_PORT = 'REFRESH_TOKEN_REPOSITORY_PORT';
export const PASSWORD_RESET_TOKEN_REPOSITORY_PORT = 'PASSWORD_RESET_TOKEN_REPOSITORY_PORT';
export const HASHING_SERVICE_PORT = 'HASHING_SERVICE_PORT';
export const TOKEN_GENERATOR_PORT = 'TOKEN_GENERATOR_PORT';
export const EMAIL_SERVICE_PORT = 'EMAIL_SERVICE_PORT';

import { User } from '../../domain/entities/user.entity';

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByCPF(cpf: string): Promise<User | null>;
  save(user: User): Promise<User>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
}

export interface RefreshTokenRepositoryPort {
  store(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<{ id: string; userId: string; expiresAt: Date; revokedAt: Date | null } | null>;
  revokeByTokenHash(tokenHash: string): Promise<void>;
  revokeAllByUserId(userId: string): Promise<void>;
}

export interface PasswordResetTokenRepositoryPort {
  create(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<{ id: string; userId: string; expiresAt: Date; usedAt: Date | null } | null>;
  markAsUsed(tokenHash: string): Promise<void>;
}

export interface HashingServicePort {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

export interface TokenGeneratorPort {
  generateAccessToken(payload: Record<string, unknown>, expiresIn: string): string;
  generateRefreshToken(): string;
  hashToken(token: string): string;
}

export interface EmailServicePort {
  sendWelcome(email: string, fullName: string): Promise<void>;
  sendPasswordReset(email: string, resetToken: string): Promise<void>;
}