import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import type { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { InvalidCredentialsException } from '../../domain/exceptions';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly loginUserUseCase: LoginUserUseCase) {
    super({ usernameField: 'email', passwordField: 'password' });
  }

  async validate(email: string, password: string) {
    try {
      const result = await this.loginUserUseCase.execute({ email, password });
      return { id: result.user.id, email: result.user.email };
    } catch {
      throw new InvalidCredentialsException();
    }
  }
}