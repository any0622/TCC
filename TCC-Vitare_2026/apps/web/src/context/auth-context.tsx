import { useState, useCallback, useEffect, type ReactNode } from "react";
import { authApi } from "../lib/api/auth.api";
import { patientsApi } from "../lib/api/patients.api";
import type { User } from "../lib/types/api.types";
import { clearPatientOfflineCache, setOfflineCacheUserScope } from "../lib/pwa/offline-cache";
import { AuthContext } from "./auth-context.interface";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Ao montar a aplicação (inclusive em todo reload/F5), verifica se já
  // existe um accessToken salvo e, se houver, busca o perfil real antes
  // de liberar a renderização das rotas protegidas — sem isso, `user`
  // permanece `null` indefinidamente até o próximo login manual.
  useEffect(() => {
    async function hydrateSession() {
      const token = localStorage.getItem("vitare:accessToken");
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        const { data } = await patientsApi.getProfile();
        setUser(data);
      } catch {
        // Token expirado/inválido e o interceptor de refresh também falhou
        // (ver client.ts) — limpa a sessão local para não deixar o app
        // preso em um estado de "autenticado sem usuário".
        localStorage.removeItem("vitare:accessToken");
        localStorage.removeItem("vitare:refreshToken");
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    }

    hydrateSession();
  }, []);

  const persistSession = useCallback(
    async (accessToken: string, refreshToken: string) => {
      localStorage.setItem("vitare:accessToken", accessToken);
      localStorage.setItem("vitare:refreshToken", refreshToken);
      const { data } = await patientsApi.getProfile();
      setOfflineCacheUserScope(data.id);
      setUser(data);
    },
    [],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const { data } = await authApi.login({ email, password });
        await persistSession(data.accessToken, data.refreshToken);
      } finally {
        setIsLoading(false);
      }
    },
    [persistSession],
  );

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      setIsLoading(true);
      try {
        const { data } = await authApi.register({ fullName, email, password });
        await persistSession(data.accessToken, data.refreshToken);
      } finally {
        setIsLoading(false);
      }
    },
    [persistSession],
  );

  const completeGoogleLogin = useCallback(
    async (code: string) => {
      setIsLoading(true);
      try {
        const { data } = await authApi.exchangeGoogleCode(code);
        await persistSession(data.accessToken, data.refreshToken);
      } finally {
        setIsLoading(false);
      }
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("vitare:accessToken");
    localStorage.removeItem("vitare:refreshToken");
    void clearPatientOfflineCache();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("vitare:accessToken");
    if (!token) return;
    const { data } = await patientsApi.getProfile();
    setUser(data);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isInitializing,
        login,
        register,
        completeGoogleLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}