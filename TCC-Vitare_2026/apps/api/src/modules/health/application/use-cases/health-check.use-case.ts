import { Injectable } from '@nestjs/common';
import { HealthCheckPort } from '../ports';
import type { PrismaService } from '../../../../infra/prisma/prisma.service';
import type { RedisService } from '../../../../../infra/redis/redis.service';

@Injectable()
export class HealthCheckUseCase implements HealthCheckPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async checkLiveness(): Promise<{ status: 'ok'; timestamp: string }> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  async checkReadiness(): Promise<{
    status: 'ok' | 'degraded' | 'error';
    timestamp: string;
    checks: { postgresql: any; redis: any };
  }> {
    const [postgresql, redis] = await Promise.all([
      this.checkPostgreSQL(),
      this.checkRedis(),
    ]);

    const overallStatus = postgresql.status === 'ok' && redis.status === 'ok' ? 'ok' : 'degraded';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: { postgresql, redis },
    };
  }

  async checkStartup(): Promise<{ status: 'ok'; timestamp: string }> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  private async checkPostgreSQL(): Promise<any> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', latencyMs: Date.now() - start };
    } catch (error) {
      return { status: 'error', latencyMs: Date.now() - start, error: 'PostgreSQL connection failed' };
    }
  }

  private async checkRedis(): Promise<any> {
    const start = Date.now();
    try {
      const isHealthy = await this.redis.ping();
      if (isHealthy) {
        return { status: 'ok', latencyMs: Date.now() - start };
      }
      return { status: 'error', latencyMs: Date.now() - start, error: 'Redis ping failed' };
    } catch (error) {
      return { status: 'error', latencyMs: Date.now() - start, error: 'Redis connection failed' };
    }
  }
}