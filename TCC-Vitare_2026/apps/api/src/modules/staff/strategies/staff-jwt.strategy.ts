import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface StaffJwtPayload {
  sub: string;
  email: string;
  type: 'staff';
}

@Injectable()
export class StaffJwtStrategy extends PassportStrategy(Strategy, 'staff-jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('STAFF_JWT_SECRET')!,
    });
  }

  validate(payload: StaffJwtPayload) {
    return { id: payload.sub, email: payload.email, type: 'staff' as const };
  }
}
