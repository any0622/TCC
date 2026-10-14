import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { RedisService } from '../../infra/redis/redis.service';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  latencyMs?: number;
  error?: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  checks: {
    postgresql: HealthCheckResult;
    redis: HealthCheckResult;
  };
}

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async checkLiveness(): Promise<{ status: 'ok'; timestamp: string }> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  async checkReadiness(): Promise<HealthResponse> {
    const [postgresql, redis] = await Promise.all([
      this.checkPostgreSQL(),
      this.checkRedis(),
    ]);

    const overallStatus =
      postgresql.status === 'ok' && redis.status === 'ok' ? 'ok' : 'degraded';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: {
        postgresql,
        redis,
      },
    };
  }

  async checkStartup(): Promise<{ status: 'ok'; timestamp: string }> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  private async checkPostgreSQL(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', latencyMs: Date.now() - start };
    } catch (error) {
      return {
        status: 'error',
        latencyMs: Date.now() - start,
        error: 'PostgreSQL connection failed',
      };
    }
  }

  private async checkRedis(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const isHealthy = await this.redis.ping();
      if (isHealthy) {
        return { status: 'ok', latencyMs: Date.now() - start };
      }
      return {
        status: 'error',
        latencyMs: Date.now() - start,
        error: 'Redis ping failed',
      };
    } catch (error) {
      return {
        status: 'error',
        latencyMs: Date.now() - start,
        error: 'Redis connection failed',
      };
    }
  }
}
