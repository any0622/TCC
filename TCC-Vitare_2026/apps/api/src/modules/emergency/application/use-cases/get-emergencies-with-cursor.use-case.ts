import { Injectable } from '@nestjs/common';
import type { EmergencyRepositoryPort } from '../ports';
import { GetEmergenciesWithCursorQuery, CursorPaginatedResult, EmergencyResult } from '../dto/emergency.dto';

@Injectable()
export class GetEmergenciesWithCursorUseCase {
  constructor(private readonly repository: EmergencyRepositoryPort) {}

  async execute(query: GetEmergenciesWithCursorQuery): Promise<CursorPaginatedResult<EmergencyResult>> {
    const result = await this.repository.findByUserWithCursor(query.userId, {
      cursor: query.cursor,
      limit: query.limit,
    });
    return {
      data: result.data.map(this.toResult),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }

  private toResult(event: any): EmergencyResult {
    return {
      id: event.id,
      userId: event.userId,
      triggeredAt: event.triggeredAt,
      latitude: event.latitude,
      longitude: event.longitude,
      patientSnapshot: event.patientSnapshot,
      status: event.status,
      notes: event.notes,
    };
  }
}