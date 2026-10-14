import { apiClient } from './client';
import { User } from '../../domain/entities';

export const patientsApi = {
  async getProfile(): Promise<User> {
    return apiClient.get('/patients/profile');
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiClient.put('/patients/profile', data);
  },

  async deleteAccount(): Promise<void> {
    await apiClient.delete('/patients/account');
  },
};