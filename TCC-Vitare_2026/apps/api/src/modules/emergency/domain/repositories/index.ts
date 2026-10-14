import { EmergencyEvent } from '../entities/emergency-event.entity';
import { PatientSnapshot } from '../entities/emergency-event.entity';

export interface CursorPaginationOptions {
  cursor?: string;
  limit: number;
}

export interface CursorPaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface TriggerEmergencyData {
  userId: string;
  latitude?: number;
  longitude?: number;
}

export abstract class EmergencyRepository {
  abstract trigger(data: TriggerEmergencyData): Promise<EmergencyEvent>;
  abstract findAllByUser(userId: string): Promise<EmergencyEvent[]>;
  abstract findByUserWithCursor(
    userId: string,
    options: CursorPaginationOptions,
  ): Promise<CursorPaginatedResult<EmergencyEvent>>;
}