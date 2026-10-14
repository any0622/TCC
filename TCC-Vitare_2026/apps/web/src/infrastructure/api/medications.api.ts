import { apiClient } from './client';
import { Medication } from '../../domain/entities';

export const medicationsApi = {
  async findAllActive(): Promise<Medication[]> {
    return apiClient.get('/medications');
  },

  async create(data: { name: string; dosage: string; frequency: string; startDate: string; endDate?: string; notes?: string }): Promise<Medication> {
    return apiClient.post('/medications', data);
  },

  async update(id: string, data: Partial<Medication>): Promise<Medication> {
    return apiClient.put(`/medications/${id}`, data);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/medications/${id}`);
  },

  async getHistory(id: string): Promise<Array<{ id: string; medicationId: string; changedAt: string; changedField: string; oldValue: string | null; newValue: string | null }>> {
    return apiClient.get(`/medications/${id}/history`);
  },
};