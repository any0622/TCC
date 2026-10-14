import { apiClient } from '../api/client';

export function getAccessToken(): string | null {
  return localStorage.getItem('vitare:accessToken');
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('vitare:refreshToken');
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('vitare:accessToken', accessToken);
  localStorage.setItem('vitare:refreshToken', refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem('vitare:accessToken');
  localStorage.removeItem('vitare:refreshToken');
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const { data } = await apiClient.post('/auth/refresh', { refreshToken });
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}