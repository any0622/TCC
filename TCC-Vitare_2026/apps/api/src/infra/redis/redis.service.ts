import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private readonly keyPrefix: string;

  constructor(private readonly config: ConfigService) {
    this.keyPrefix = this.config.get<string>('REDIS_KEY_PREFIX') ?? 'vitare:';
  }

  async onModuleInit(): Promise<void> {
    this.client = new Redis({
      host: this.config.get<string>('REDIS_HOST'),
      port: this.config.get<number>('REDIS_PORT'),
      password: this.config.get<string>('REDIS_PASSWORD'),
      tls: this.config.get<boolean>('REDIS_TLS') ? {} : undefined,
      connectTimeout: this.config.get<number>('REDIS_CONNECT_TIMEOUT'),
      commandTimeout: this.config.get<number>('REDIS_COMMAND_TIMEOUT'),
      retryStrategy: (times) => {
        if (times > 3) {
          this.logger.warn('Redis connection retry limit reached');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    this.client.on('connect', () => {
      this.logger.log('Redis client connected');
    });

    this.client.on('ready', () => {
      this.logger.log('Redis client ready');
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis client error', error.message);
    });

    this.client.on('close', () => {
      this.logger.warn('Redis connection closed');
    });

    this.client.on('reconnecting', () => {
      this.logger.log('Redis client reconnecting...');
    });

    try {
      await this.client.connect();
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
    this.logger.log('Redis connection closed gracefully');
  }

  getClient(): Redis {
    return this.client;
  }

  getKeyPrefix(): string {
    return this.keyPrefix;
  }

  buildKey(...parts: string[]): string {
    return `${this.keyPrefix}${parts.join(':')}`;
  }

  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(this.buildKey(key));
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.setex(this.buildKey(key), ttlSeconds, serialized);
    } else {
      await this.client.set(this.buildKey(key), serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(this.buildKey(key));
  }

  async exists(key: string): Promise<boolean> {
    const count = await this.client.exists(this.buildKey(key));
    return count === 1;
  }

  async hset(key: string, field: string, value: unknown): Promise<void> {
    await this.client.hset(this.buildKey(key), field, JSON.stringify(value));
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    const value = await this.client.hget(this.buildKey(key), field);
    return value ? JSON.parse(value) : null;
  }

  async hgetall<T>(key: string): Promise<Record<string, T>> {
    const data = await this.client.hgetall(this.buildKey(key));
    const result: Record<string, T> = {};
    for (const [field, value] of Object.entries(data)) {
      try {
        result[field] = JSON.parse(value);
      } catch {
        result[field] = value as unknown as T;
      }
    }
    return result;
  }

  async hdel(key: string, ...fields: string[]): Promise<void> {
    await this.client.hdel(this.buildKey(key), ...fields);
  }

  async geoadd(
    key: string,
    longitude: number,
    latitude: number,
    member: string,
  ): Promise<void> {
    await this.client.geoadd(this.buildKey(key), longitude, latitude, member);
  }

  async geosearch(
    key: string,
    longitude: number,
    latitude: number,
    radiusMeters: number,
    count?: number,
  ): Promise<Array<{ member: string; distance: number }>> {
    const results = await (this.client as any).geosearch(
      this.buildKey(key),
      'FROMLONLAT',
      longitude,
      latitude,
      'BYRADIUS',
      radiusMeters,
      'm',
      count ? 'COUNT' : undefined,
      count,
      'WITHDIST',
      'WITHCOORD',
    );
    return (results || []).map((r: any) => ({
      member: r[0] || r.member,
      distance: (r[1] || r.dist) ?? 0,
    }));
  }

  async zrem(key: string, member: string): Promise<void> {
    await this.client.zrem(this.buildKey(key), member);
  }

  async eval(
    script: string,
    numKeys: number,
    ...keys: string[]
  ): Promise<unknown> {
    const prefixedKeys = keys.map((k) => this.buildKey(k));
    return this.client.eval(script, numKeys, ...prefixedKeys);
  }

  async evalsha(
    sha: string,
    numKeys: number,
    ...keys: string[]
  ): Promise<unknown> {
    const prefixedKeys = keys.map((k) => this.buildKey(k));
    return this.client.evalsha(sha, numKeys, ...prefixedKeys);
  }

  async scriptLoad(script: string): Promise<string> {
    return this.client.script('LOAD', script) as Promise<string>;
  }
}
