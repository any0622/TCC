export const HEALTH_REPOSITORY_PORT = 'HEALTH_REPOSITORY_PORT';
export interface HealthCheckPort {
  checkLiveness(): Promise<{ status: 'ok'; timestamp: string }>;
  checkReadiness(): Promise<{
    status: 'ok' | 'degraded' | 'error';
    timestamp: string;
    checks: { postgresql: any; redis: any };
  }>;
  checkStartup(): Promise<{ status: 'ok'; timestamp: string }>;
}