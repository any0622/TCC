export class HealthCheckResponseDto {
  status!: 'ok';
  timestamp!: string;
}

export class HealthReadinessResponseDto {
  status!: 'ok' | 'degraded' | 'error';
  timestamp!: string;
  checks!: {
    postgresql: { status: 'ok' | 'error'; latencyMs?: number; error?: string };
    redis: { status: 'ok' | 'error'; latencyMs?: number; error?: string };
  };
}