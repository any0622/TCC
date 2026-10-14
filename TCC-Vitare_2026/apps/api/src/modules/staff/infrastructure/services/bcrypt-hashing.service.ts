import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HashingServicePort } from '../../application/ports';

@Injectable()
export class BcryptHashingService implements HashingServicePort {
  private readonly saltRounds = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}