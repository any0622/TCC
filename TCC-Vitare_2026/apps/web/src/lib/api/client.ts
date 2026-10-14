import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Injeta o accessToken em toda requisição autenticada
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("vitare:accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Renova o token automaticamente em caso de 401, sem exigir novo login
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem("vitare:refreshToken");

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
        );
        localStorage.setItem("vitare:accessToken", data.accessToken);
        localStorage.setItem("vitare:refreshToken", data.refreshToken);

        refreshQueue.forEach((cb) => cb(data.accessToken));
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch {
        localStorage.removeItem("vitare:accessToken");
        localStorage.removeItem("vitare:refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);