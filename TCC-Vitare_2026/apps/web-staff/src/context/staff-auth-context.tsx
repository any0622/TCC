import { useState, useCallback, useEffect, type ReactNode } from "react";
import { staffAuthApi } from "../lib/api/staff-auth.api";
import type { Staff } from "../lib/types/api.types";
import { StaffAuthContext, type RegisterStaffData } from "./staff-auth.context";

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function hydrateSession() {
      const token = localStorage.getItem("vitare:staff:accessToken");
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        const { data } = await staffAuthApi.me();
        setStaff(data);
        localStorage.setItem("vitare:staff:profile", JSON.stringify(data));
      } catch {
        localStorage.removeItem("vitare:staff:accessToken");
        localStorage.removeItem("vitare:staff:profile");
        setStaff(null);
      } finally {
        setIsInitializing(false);
      }
    }

    hydrateSession();
  }, []);

  const persistSession = useCallback((accessToken: string, staffData: Staff) => {
    localStorage.setItem("vitare:staff:accessToken", accessToken);
    localStorage.setItem("vitare:staff:profile", JSON.stringify(staffData));
    setStaff(staffData);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await staffAuthApi.login({ email, password });
      persistSession(data.accessToken, data.staff);
    } finally {
      setIsLoading(false);
    }
  }, [persistSession]);

  const register = useCallback(async (data: RegisterStaffData) => {
    setIsLoading(true);
    try {
      const response = await staffAuthApi.register(data);
      persistSession(response.data.accessToken, response.data.staff);
    } finally {
      setIsLoading(false);
    }
  }, [persistSession]);

  const logout = useCallback(() => {
    localStorage.removeItem("vitare:staff:accessToken");
    localStorage.removeItem("vitare:staff:profile");
    setStaff(null);
  }, []);

  return (
    <StaffAuthContext.Provider value={{
      staff,
      isAuthenticated: !!staff,
      isLoading,
      isInitializing,
      login,
      register,
      logout,
    }}>
      {children}
    </StaffAuthContext.Provider>
  );
}