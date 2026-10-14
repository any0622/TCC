import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';

export interface IdempotencyRecord {
  key: string;
  userId: string;
  operation: string;
  payloadHash: string;
  result?: unknown;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

const IDEMPOTENCY_TTL_SECONDS = 86400 * 7;
const PROCESSING_TIMEOUT_SECONDS = 30;

const LUA_ACQUIRE_IDEMPOTENCY = `
local key = KEYS[1]
local userId = ARGV[1]
local operation = ARGV[2]
local payloadHash = ARGV[3]
local ttl = tonumber(ARGV[4])
local processingTimeout = tonumber(ARGV[5])
local now = tonumber(ARGV[6])

local existing = redis.call('HMGET', key, 'userId', 'operation', 'payloadHash', 'status', 'createdAt')
if existing[1] then
  if existing[1] ~= userId then
    return {err = 'IDMP_CONFLICT_USER'}
  end
  if existing[2] ~= operation then
    return {err = 'IDMP_CONFLICT_OPERATION'}
  end
  if existing[3] ~= payloadHash then
    return {err = 'IDMP_CONFLICT_PAYLOAD'}
  end
  if existing[4] == 'completed' then
    return {status = 'completed', result = redis.call('HGET', key, 'result')}
  end
  if existing[4] == 'processing' then
    local createdAt = tonumber(existing[5])
    if now - createdAt > processingTimeout then
      redis.call('HSET', key, 'status', 'failed', 'completedAt', now)
    else
      return {status = 'processing'}
    end
  end
end

redis.call('HSET', key,
  'userId', userId,
  'operation', operation,
  'payloadHash', payloadHash,
  'status', 'processing',
  'createdAt', now
)
redis.call('EXPIRE', key, ttl)
return {status = 'acquired'}
`;

const LUA_COMPLETE_IDEMPOTENCY = `
local key = KEYS[1]
local status = ARGV[1]
local result = ARGV[2]
local now = tonumber(ARGV[3])

local existing = redis.call('HMGET', key, 'status')
if not existing[1] then
  return {err = 'IDMP_NOT_FOUND'}
end

if status == 'completed' then
  redis.call('HSET', key, 'status', 'completed', 'result', result, 'completedAt', now)
else
  redis.call('HSET', key, 'status', 'failed', 'completedAt', now)
end
return {status = 'ok'}
`;

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);
  private acquireSha: string | null = null;
  private completeSha: string | null = null;

  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  private async ensureScriptsLoaded(): Promise<void> {
    if (!this.acquireSha) {
      this.acquireSha = await this.redis.scriptLoad(LUA_ACQUIRE_IDEMPOTENCY);
    }
    if (!this.completeSha) {
      this.completeSha = await this.redis.scriptLoad(LUA_COMPLETE_IDEMPOTENCY);
    }
  }

  async acquire(
    idempotencyKey: string,
    userId: string,
    operation: string,
    payload: unknown,
  ): Promise<{
    acquired: boolean;
    existingResult?: unknown;
    status:
      | 'acquired'
      | 'processing'
      | 'completed'
      | 'conflict_user'
      | 'conflict_operation'
      | 'conflict_payload';
  }> {
    await this.ensureScriptsLoaded();

    const payloadHash = this.hashPayload(payload);
    const now = Date.now();
    const fullKey = this.redis.buildKey('idempotency', idempotencyKey);

    try {
      const result = (await this.redis.evalsha(
        this.acquireSha!,
        1,
        fullKey,
        userId,
        operation,
        payloadHash,
        String(IDEMPOTENCY_TTL_SECONDS),
        String(PROCESSING_TIMEOUT_SECONDS),
        String(now),
      )) as { status: string; result?: string; err?: string };

      if (result.err) {
        switch (result.err) {
          case 'IDMP_CONFLICT_USER':
            return { acquired: false, status: 'conflict_user' };
          case 'IDMP_CONFLICT_OPERATION':
            return { acquired: false, status: 'conflict_operation' };
          case 'IDMP_CONFLICT_PAYLOAD':
            return { acquired: false, status: 'conflict_payload' };
          default:
            return { acquired: false, status: 'conflict_payload' };
        }
      }

      if (result.status === 'completed') {
        return {
          acquired: false,
          existingResult: result.result ? JSON.parse(result.result) : undefined,
          status: 'completed',
        };
      }

      if (result.status === 'processing') {
        return { acquired: false, status: 'processing' };
      }

      return { acquired: true, status: 'acquired' };
    } catch (error) {
      this.logger.warn(
        `Idempotency acquire failed, falling back to PostgreSQL`,
        error,
      );
      return this.acquireFallback(
        idempotencyKey,
        userId,
        operation,
        payloadHash,
      );
    }
  }

  async complete(
    idempotencyKey: string,
    success: boolean,
    result?: unknown,
  ): Promise<void> {
    await this.ensureScriptsLoaded();

    const fullKey = this.redis.buildKey('idempotency', idempotencyKey);
    const now = Date.now();

    try {
      await this.redis.evalsha(
        this.completeSha!,
        1,
        fullKey,
        success ? 'completed' : 'failed',
        JSON.stringify(result ?? null),
        String(now),
      );
    } catch (error) {
      this.logger.warn(`Idempotency complete failed in Redis`, error);
    }

    try {
      await this.prisma.idempotencyKey.upsert({
        where: { key: idempotencyKey },
        update: {
          status: success ? 'COMPLETED' : 'FAILED',
          result: result as any,
          completedAt: new Date(),
        },
        create: {
          key: idempotencyKey,
          userId: '',
          operation: '',
          payloadHash: '',
          status: success ? 'COMPLETED' : 'FAILED',
          result: result as any,
          completedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.warn(`Idempotency complete failed in PostgreSQL`, error);
    }
  }

  private async acquireFallback(
    idempotencyKey: string,
    userId: string,
    operation: string,
    payloadHash: string,
  ): Promise<{
    acquired: boolean;
    existingResult?: unknown;
    status:
      | 'acquired'
      | 'processing'
      | 'completed'
      | 'conflict_user'
      | 'conflict_operation'
      | 'conflict_payload';
  }> {
    try {
      const existing = await this.prisma.idempotencyKey.findUnique({
        where: { key: idempotencyKey },
      });

      if (existing) {
        if (existing.userId !== userId) {
          return { acquired: false, status: 'conflict_user' };
        }
        if (existing.operation !== operation) {
          return { acquired: false, status: 'conflict_operation' };
        }
        if (existing.payloadHash !== payloadHash) {
          return { acquired: false, status: 'conflict_payload' };
        }
        if (existing.status === 'COMPLETED') {
          return {
            acquired: false,
            existingResult: existing.result,
            status: 'completed',
          };
        }
        if (existing.status === 'PROCESSING') {
          const age = Date.now() - existing.createdAt.getTime();
          if (age > PROCESSING_TIMEOUT_SECONDS * 1000) {
            await this.prisma.idempotencyKey.update({
              where: { key: idempotencyKey },
              data: { status: 'FAILED', completedAt: new Date() },
            });
          } else {
            return { acquired: false, status: 'processing' };
          }
        }
      }

      await this.prisma.idempotencyKey.upsert({
        where: { key: idempotencyKey },
        update: {
          status: 'PROCESSING',
          userId,
          operation,
          payloadHash,
        },
        create: {
          key: idempotencyKey,
          userId,
          operation,
          payloadHash,
          status: 'PROCESSING',
        },
      });

      return { acquired: true, status: 'acquired' };
    } catch (error) {
      this.logger.error('Idempotency fallback failed', error);
      return { acquired: false, status: 'conflict_payload' };
    }
  }

  private hashPayload(payload: unknown): string {
    const crypto = require('node:crypto');
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex');
  }
}
