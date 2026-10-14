import { User } from '../../../../generated/prisma/client';

export abstract class AuthRepository {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByGoogleId(googleId: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract createLocalUser(data: {
    fullName: string;
    email: string;
    passwordHash: string;
  }): Promise<User>;
  abstract createGoogleUser(data: {
    fullName: string;
    email: string;
    googleId: string;
    avatarUrl?: string;
  }): Promise<User>;
  abstract updatePassword(userId: string, passwordHash: string): Promise<void>;

  abstract storeRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;
  abstract findRefreshToken(tokenHash: string): Promise<{
    id: string;
    userId: string;
    expiresAt: Date;
    revokedAt: Date | null;
  } | null>;
  abstract revokeRefreshToken(tokenHash: string): Promise<void>;
  abstract revokeAllRefreshTokens(userId: string): Promise<void>;

  abstract createPasswordResetToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;
  abstract findPasswordResetToken(tokenHash: string): Promise<{
    id: string;
    userId: string;
    expiresAt: Date;
    usedAt: Date | null;
  } | null>;
  abstract markPasswordResetTokenUsed(tokenHash: string): Promise<void>;
}
