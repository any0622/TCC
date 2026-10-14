import { apiClient } from './client';
import { Allergy } from '../../domain/entities';

export const allergiesApi = {
  async findAll(): Promise<Allergy[]> {
    return apiClient.get('/allergies');
  },

  async create(data: { name: string; severity?: string; notes?: string }): Promise<Allergy> {
    return apiClient.post('/allergies', data);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/allergies/${id}`);
  },
};