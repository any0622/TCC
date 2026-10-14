import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshQueue: Array<(token: string) => void> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = this.getAccessToken();
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
          originalRequest._retry = true;

          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshQueue.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.client(originalRequest));
              });
            });
          }

          this.isRefreshing = true;
          const refreshToken = this.getRefreshToken();

          try {
            const { data } = await axios.post(
              `${API_BASE_URL}/auth/refresh`,
              { refreshToken },
            );
            this.setTokens(data.accessToken, data.refreshToken);

            this.refreshQueue.forEach((cb) => cb(data.accessToken));
            this.refreshQueue = [];

            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return this.client(originalRequest);
          } catch {
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(error);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('vitare:accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('vitare:refreshToken');
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('vitare:accessToken', accessToken);
    localStorage.setItem('vitare:refreshToken', refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem('vitare:accessToken');
    localStorage.removeItem('vitare:refreshToken');
  }

  async get<T>(url: string, config?: any): Promise<T> {
    const { data } = await this.client.get<T>(url, config);
    return data;
  }

  async post<T>(url: string, body?: any, config?: any): Promise<T> {
    const { data } = await this.client.post<T>(url, body, config);
    return data;
  }

  async put<T>(url: string, body?: any, config?: any): Promise<T> {
    const { data } = await this.client.put<T>(url, body, config);
    return data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const { data } = await this.client.delete<T>(url, config);
    return data;
  }
}

export const apiClient = new ApiClient();