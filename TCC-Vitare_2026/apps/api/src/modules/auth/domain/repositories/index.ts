import { User } from '../entities/user.entity';

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

export interface PasswordResetTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
}

export interface GoogleProfile {
  googleId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export abstract class UserRepository {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByGoogleId(googleId: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByCPF(cpf: string): Promise<User | null>;
  abstract save(user: User): Promise<User>;
  abstract updatePassword(userId: string, passwordHash: string): Promise<void>;
}

export abstract class RefreshTokenRepository {
  abstract store(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;
  abstract findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  abstract revokeByTokenHash(tokenHash: string): Promise<void>;
  abstract revokeAllByUserId(userId: string): Promise<void>;
}

export abstract class PasswordResetTokenRepository {
  abstract create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;
  abstract findByTokenHash(tokenHash: string): Promise<PasswordResetTokenRecord | null>;
  abstract markAsUsed(tokenHash: string): Promise<void>;
}