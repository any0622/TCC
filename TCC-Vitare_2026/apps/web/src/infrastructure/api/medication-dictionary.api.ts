import { apiClient } from './client';
import { MedicationDictionaryResult } from '../../domain/entities';

export const medicationDictionaryApi = {
  async search(query: string): Promise<MedicationDictionaryResult[]> {
    const params = new URLSearchParams();
    params.append('search', query);
    return apiClient.get(`/medications-dictionary?${params.toString()}`);
  },

  async findById(id: string): Promise<MedicationDictionaryResult | null> {
    return apiClient.get(`/medications-dictionary/${id}`);
  },
};