import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Staff } from '../../domain/entities';
import { staffAuthApi } from '../../infrastructure/api/staff-auth.api';
import { isStaffAuthenticated, getStaffAccessToken, setStaffAccessToken, clearStaffAccessToken } from '../../infrastructure/auth/token-storage';

interface StaffAuthContextValue {
  staff: Staff | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { fullName: string; email: string; cpf: string; registrationNumber: string; role: string; password: string }) => Promise<void>;
  bootstrapAdmin: (data: { fullName: string; email: string; cpf: string; registrationNumber: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshStaff: () => Promise<void>;
}

const StaffAuthContext = createContext<StaffAuthContextValue | undefined>(undefined);

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (isStaffAuthenticated()) {
        try {
          await refreshStaff();
        } catch {
          clearStaffAccessToken();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const refreshStaff = async () => {
    const profile = await staffAuthApi.me();
    setStaff(profile);
  };

  const login = async (email: string, password: string) => {
    const tokenPair = await staffAuthApi.login({ email, password });
    setStaffAccessToken(tokenPair.accessToken);
    setStaff(tokenPair.staff);
  };

  const register = async (data: { fullName: string; email: string; cpf: string; registrationNumber: string; role: string; password: string }) => {
    const tokenPair = await staffAuthApi.register(data);
    setStaffAccessToken(tokenPair.accessToken);
    setStaff(tokenPair.staff);
  };

  const bootstrapAdmin = async (data: { fullName: string; email: string; cpf: string; registrationNumber: string; password: string }) => {
    const tokenPair = await staffAuthApi.bootstrapAdmin(data);
    setStaffAccessToken(tokenPair.accessToken);
    setStaff(tokenPair.staff);
  };

  const logout = () => {
    clearStaffAccessToken();
    setStaff(null);
  };

  return (
    <StaffAuthContext.Provider value={{ staff, isLoading, isAuthenticated: !!staff, login, register, bootstrapAdmin, logout, refreshStaff }}>
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const context = useContext(StaffAuthContext);
  if (!context) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
}