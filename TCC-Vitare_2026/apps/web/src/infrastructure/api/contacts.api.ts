import { apiClient } from './client';
import { EmergencyContact } from '../../domain/entities';

export const contactsApi = {
  async findAll(): Promise<EmergencyContact[]> {
    return apiClient.get('/contacts');
  },

  async create(data: { name: string; phone: string; relationship?: string; isPrimary?: boolean }): Promise<EmergencyContact> {
    return apiClient.post('/contacts', data);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/contacts/${id}`);
  },
};