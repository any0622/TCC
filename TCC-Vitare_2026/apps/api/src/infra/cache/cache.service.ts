import { Injectable, Logger } from '@nestjs/common';
import type { RedisService } from '../redis/redis.service';

export interface CacheOptions {
  ttlSeconds?: number;
  namespace?: string;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTtl = 86400;

  constructor(private readonly redis: RedisService) {}

  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const fullKey = this.buildKey(key, options?.namespace);
    try {
      const value = await this.redis.get<T>(fullKey);
      return value;
    } catch (error) {
      this.logger.warn(`Cache GET failed for key: ${fullKey}`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const fullKey = this.buildKey(key, options?.namespace);
    const ttl = options?.ttlSeconds ?? this.defaultTtl;
    try {
      await this.redis.set(fullKey, value, ttl);
    } catch (error) {
      this.logger.warn(`Cache SET failed for key: ${fullKey}`, error);
    }
  }

  async delete(key: string, options?: CacheOptions): Promise<void> {
    const fullKey = this.buildKey(key, options?.namespace);
    try {
      await this.redis.del(fullKey);
    } catch (error) {
      this.logger.warn(`Cache DELETE failed for key: ${fullKey}`, error);
    }
  }

  async invalidateNamespace(namespace: string): Promise<void> {
    try {
      const pattern = this.redis.buildKey(`${namespace}:*`);
      const client = this.redis.getClient();
      let cursor = '0';
      do {
        const [newCursor, keys] = await client.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100,
        );
        cursor = newCursor;
        if (keys.length > 0) {
          await client.del(...keys);
        }
      } while (cursor !== '0');
    } catch (error) {
      this.logger.warn(
        `Cache namespace invalidation failed: ${namespace}`,
        error,
      );
    }
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    const fresh = await factory();
    await this.set(key, fresh, options);
    return fresh;
  }

  private buildKey(key: string, namespace?: string): string {
    if (namespace) {
      return `${namespace}:${key}`;
    }
    return key;
  }
}
