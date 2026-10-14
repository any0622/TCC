import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(config: ConfigService) {
    super({
      scope: ['email', 'profile'],
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL'),
    });
  }
}