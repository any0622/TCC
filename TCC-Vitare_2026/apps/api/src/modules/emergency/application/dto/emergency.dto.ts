export interface TriggerEmergencyCommand {
  userId: string;
  latitude?: number;
  longitude?: number;
  idempotencyKey: string;
}

export interface GetEmergenciesQuery {
  userId: string;
}

export interface GetEmergenciesWithCursorQuery {
  userId: string;
  cursor?: string;
  limit: number;
}

export interface EmergencyResult {
  id: string;
  userId: string;
  triggeredAt: Date;
  latitude: number | null;
  longitude: number | null;
  patientSnapshot: any;
  status: 'TRIGGERED' | 'NOTIFIED' | 'RESOLVED';
  notes: string | null;
}

export interface CursorPaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}