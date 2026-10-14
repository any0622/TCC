import axios from "axios";

function resolveStaffApiBaseUrl(value: string | undefined): string {
  const configured = value?.trim();

  if (!configured) return "/api/v1";
  if (configured.endsWith("/api/v1")) return configured;
  if (configured.endsWith("/api")) return `${configured}/v1`;

  return `${configured.replace(/\/$/, "")}/api/v1`;
}

export const staffApiClient = axios.create({
  baseURL: resolveStaffApiBaseUrl(import.meta.env.VITE_API_URL),
  timeout: 10_000,
});

staffApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("vitare:staff:accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

staffApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("vitare:staff:accessToken");
      localStorage.removeItem("vitare:staff:profile");

      if (!window.location.pathname.startsWith("/monitoramento/login")) {
        window.location.href = "/monitoramento/login";
      }
    }

    return Promise.reject(error);
  },
);