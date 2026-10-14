export function getStaffAccessToken(): string | null {
  return localStorage.getItem('vitare:staff:accessToken');
}

export function setStaffAccessToken(token: string): void {
  localStorage.setItem('vitare:staff:accessToken', token);
}

export function clearStaffAccessToken(): void {
  localStorage.removeItem('vitare:staff:accessToken');
}

export function isStaffAuthenticated(): boolean {
  return !!getStaffAccessToken();
}