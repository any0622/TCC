import { Injectable } from '@nestjs/common';
import type { EmergencyRepositoryPort } from '../ports';
import { GetEmergenciesQuery, EmergencyResult } from '../dto/emergency.dto';

@Injectable()
export class GetEmergenciesUseCase {
  constructor(private readonly repository: EmergencyRepositoryPort) {}

  async execute(query: GetEmergenciesQuery): Promise<EmergencyResult[]> {
    const events = await this.repository.findAllByUser(query.userId);
    return events.map(this.toResult);
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