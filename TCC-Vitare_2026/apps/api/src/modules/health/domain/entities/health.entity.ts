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