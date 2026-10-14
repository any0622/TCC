import { apiClient } from './client';
import { ForbiddenMedication } from '../../domain/entities';

export const forbiddenMedicationsApi = {
  async findAll(): Promise<ForbiddenMedication[]> {
    return apiClient.get('/forbidden-medications');
  },

  async create(data: { medicationsDictionaryId: string; reason: string }): Promise<ForbiddenMedication> {
    return apiClient.post('/forbidden-medications', data);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/forbidden-medications/${id}`);
  },
};