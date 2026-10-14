import { staffApiClient } from './client';
import { EmergencyEvent } from '../../domain/entities';

export const emergenciesApi = {
  async findAll(cursor?: string, limit?: number): Promise<{ data: EmergencyEvent[]; nextCursor: string | null; hasMore: boolean }> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    if (limit) params.append('limit', limit.toString());
    return staffApiClient.get(`/emergency?${params.toString()}`);
  },

  async findNearby(latitude: number, longitude: number, radiusKm: number): Promise<EmergencyEvent[]> {
    const params = new URLSearchParams();
    params.append('latitude', latitude.toString());
    params.append('longitude', longitude.toString());
    params.append('radiusKm', radiusKm.toString());
    return staffApiClient.get(`/emergency/nearby?${params.toString()}`);
  },

  async getPatientSnapshot(emergencyId: string): Promise<any> {
    return staffApiClient.get(`/emergency/${emergencyId}/snapshot`);
  },
};