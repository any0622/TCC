import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import type { ValidateGoogleUserUseCase } from '../../application/use-cases/google-auth.use-case';
import type { CompleteGoogleLoginUseCase } from '../../application/use-cases/google-auth.use-case';

export interface GoogleProfile {
  googleId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private readonly validateGoogleUserUseCase: ValidateGoogleUserUseCase,
    private readonly completeGoogleLoginUseCase: CompleteGoogleLoginUseCase,
  ) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: Error | null, user?: any) => void,
  ) {
    try {
      const googleProfile: GoogleProfile = {
        googleId: profile.id,
        email: profile.emails?.[0]?.value || '',
        fullName: profile.displayName || '',
        avatarUrl: profile.photos?.[0]?.value,
      };

      const user = await this.validateGoogleUserUseCase.execute(googleProfile);
      const tokenPair = await this.completeGoogleLoginUseCase.execute(user);

      done(null, { ...tokenPair, user });
    } catch (error) {
      done(error, null);
    }
  }
}