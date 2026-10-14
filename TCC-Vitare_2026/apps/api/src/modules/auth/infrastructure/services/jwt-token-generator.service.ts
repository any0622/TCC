import { Injectable } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import type { ConfigService } from '@nestjs/config';
import { TokenGeneratorPort } from '../../application/ports';

@Injectable()
export class JwtTokenGenerator implements TokenGeneratorPort {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  generateAccessToken(payload: Record<string, unknown>, expiresIn: string): string {
    return this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn,
    } as any);
  }

  generateRefreshToken(): string {
    const { randomBytes } = require('node:crypto');
    return randomBytes(32).toString('hex');
  }

  hashToken(token: string): string {
    const { createHash } = require('node:crypto');
    return createHash('sha256').update(token).digest('hex');
  }
}