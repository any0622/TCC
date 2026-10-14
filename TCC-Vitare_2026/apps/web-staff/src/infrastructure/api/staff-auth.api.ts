import { staffApiClient } from './client';
import { StaffTokenPair } from '../../domain/entities';

export const staffAuthApi = {
  async login(data: { email: string; password: string }): Promise<StaffTokenPair> {
    return staffApiClient.post('/staff/auth/login', data);
  },

  async register(data: { fullName: string; email: string; cpf: string; registrationNumber: string; role: string; password: string }): Promise<StaffTokenPair> {
    return staffApiClient.post('/staff/auth/register', data);
  },

  async bootstrapAdmin(data: { fullName: string; email: string; cpf: string; registrationNumber: string; password: string }): Promise<StaffTokenPair> {
    return staffApiClient.post('/staff/auth/bootstrap', data);
  },

  async me(): Promise<any> {
    return staffApiClient.get('/staff/auth/me');
  },
};