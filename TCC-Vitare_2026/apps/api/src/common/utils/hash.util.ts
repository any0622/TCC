import { randomBytes, createHash } from 'node:crypto';
import * as bcrypt from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function generateOpaqueToken(): string {
  return randomBytes(32).toString('hex');
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
