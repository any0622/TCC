import { apiClient } from "./client";
import type { TokenPair } from "../types/api.types";

export const authApi = {
  register: (data: { fullName: string; email: string; password: string }) =>
    apiClient.post<TokenPair>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<TokenPair>("/auth/login", data),

  forgotPassword: (email: string) =>
    apiClient.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post("/auth/reset-password", { token, newPassword }),

  googleLoginUrl: () => `${import.meta.env.VITE_API_URL || "/api/v1"}/auth/google`,

  exchangeGoogleCode: (code: string) =>
    apiClient.post<TokenPair>("/auth/google/exchange", { code }),
};