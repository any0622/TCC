import { apiClient } from './client';
import { ChronicCondition } from '../../domain/entities';

export const conditionsApi = {
  async findAllActive(): Promise<ChronicCondition[]> {
    return apiClient.get('/conditions');
  },

  async create(data: { diseaseId: string; notes?: string; diagnosedAt?: string }): Promise<ChronicCondition> {
    return apiClient.post('/conditions', data);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/conditions/${id}`);
  },
};