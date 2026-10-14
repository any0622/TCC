import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

class StaffApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('vitare:staff:accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          localStorage.removeItem('vitare:staff:accessToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        return Promise.reject(error);
      },
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('vitare:staff:accessToken');
  }

  setAccessToken(token: string): void {
    localStorage.setItem('vitare:staff:accessToken', token);
  }

  clearAccessToken(): void {
    localStorage.removeItem('vitare:staff:accessToken');
  }

  async get<T>(url: string, config?: any): Promise<T> {
    const { data } = await this.client.get<T>(url, config);
    return data;
  }

  async post<T>(url: string, body?: any, config?: any): Promise<T> {
    const { data } = await this.client.post<T>(url, body, config);
    return data;
  }
}

export const staffApiClient = new StaffApiClient();