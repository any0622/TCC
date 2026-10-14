export const EMERGENCY_REPOSITORY_PORT = 'EMERGENCY_REPOSITORY_PORT';
import { EmergencyEvent } from '../../domain/entities/emergency-event.entity';
import { PatientSnapshot } from '../../domain/entities/emergency-event.entity';

export interface EmergencyRepositoryPort {
  trigger(data: {
    userId: string;
    latitude?: number;
    longitude?: number;
  }): Promise<EmergencyEvent>;
  findAllByUser(userId: string): Promise<EmergencyEvent[]>;
  findByUserWithCursor(
    userId: string,
    options: { cursor?: string; limit: number },
  ): Promise<{
    data: EmergencyEvent[];
    nextCursor: string | null;
    hasMore: boolean;
  }>;
}

export interface IdempotencyServicePort {
  acquire(key: string, userId: string, operation: string, payload: any): Promise<{
    acquired: boolean;
    existingResult?: any;
    status: 'acquired' | 'processing' | 'completed' | 'conflict_user' | 'conflict_operation' | 'conflict_payload';
  }>;
  complete(key: string, success: boolean, result?: any): Promise<void>;
}

export interface OutboxServicePort {
  addEvent(event: {
    eventType: string;
    aggregateId: string;
    payload: Record<string, any>;
  }): Promise<void>;
}