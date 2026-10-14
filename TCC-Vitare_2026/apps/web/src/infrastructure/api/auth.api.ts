import { apiClient } from './client';
import { TokenPair } from '../../domain/entities';

export const authApi = {
  async register(data: { fullName: string; email: string; password: string }): Promise<TokenPair> {
    return apiClient.post('/auth/register', data);
  },

  async login(data: { email: string; password: string }): Promise<TokenPair> {
    return apiClient.post('/auth/login', data);
  },

  async refresh(refreshToken: string): Promise<TokenPair> {
    return apiClient.post('/auth/refresh', { refreshToken });
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, newPassword });
  },

  async exchangeGoogleCode(code: string): Promise<TokenPair> {
    return apiClient.post('/auth/google/exchange', { code });
  },
};