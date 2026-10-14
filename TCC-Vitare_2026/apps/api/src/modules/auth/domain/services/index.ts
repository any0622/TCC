export interface HashingService {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

export interface TokenGenerator {
  generateAccessToken(payload: Record<string, unknown>, expiresIn: string): string;
  generateRefreshToken(): string;
  hashToken(token: string): string;
}

export interface EmailService {
  sendWelcome(email: string, fullName: string): Promise<void>;
  sendPasswordReset(email: string, resetToken: string): Promise<void>;
}