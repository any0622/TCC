import { apiClient } from './client';
import { DiseaseDictionaryResult } from '../../domain/entities';

export const diseaseDictionaryApi = {
  async search(query: string): Promise<DiseaseDictionaryResult[]> {
    const params = new URLSearchParams();
    params.append('search', query);
    return apiClient.get(`/disease-dictionary?${params.toString()}`);
  },

  async findById(id: string): Promise<DiseaseDictionaryResult | null> {
    return apiClient.get(`/disease-dictionary/${id}`);
  },
};