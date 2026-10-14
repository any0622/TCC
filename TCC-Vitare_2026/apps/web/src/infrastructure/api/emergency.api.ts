import { apiClient } from './client';
import { EmergencyEvent } from '../../domain/entities';

export const emergencyApi = {
  async trigger(data: { latitude?: number; longitude?: number; idempotencyKey: string }): Promise<EmergencyEvent> {
    return apiClient.post('/emergency/trigger', data, {
      headers: { 'X-Idempotency-Key': data.idempotencyKey },
    });
  },

  async findAll(): Promise<EmergencyEvent[]> {
    return apiClient.get('/emergency');
  },

  async findAllWithCursor(cursor?: string, limit?: number): Promise<{ data: EmergencyEvent[]; nextCursor: string | null; hasMore: boolean }> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    if (limit) params.append('limit', limit.toString());
    return apiClient.get(`/emergency?${params.toString()}`);
  },
};