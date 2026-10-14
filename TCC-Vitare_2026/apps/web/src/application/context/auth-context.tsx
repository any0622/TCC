import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, TokenPair } from '../../domain/entities';
import { authApi } from '../../infrastructure/api/auth.api';
import { patientsApi } from '../../infrastructure/api/patients.api';
import { isAuthenticated, getAccessToken, setTokens, clearTokens, refreshAccessToken } from '../../infrastructure/auth/token-storage';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { fullName: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated()) {
        try {
          await refreshUser();
        } catch {
          clearTokens();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const refreshUser = async () => {
    const profile = await patientsApi.getProfile();
    setUser(profile);
  };

  const login = async (email: string, password: string) => {
    const tokenPair = await authApi.login({ email, password });
    setTokens(tokenPair.accessToken, tokenPair.refreshToken);
    setUser(tokenPair.user);
  };

  const register = async (data: { fullName: string; email: string; password: string }) => {
    const tokenPair = await authApi.register(data);
    setTokens(tokenPair.accessToken, tokenPair.refreshToken);
    setUser(tokenPair.user);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    await authApi.forgotPassword(email);
  };

  const resetPassword = async (token: string, newPassword: string) => {
    await authApi.resetPassword(token, newPassword);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, forgotPassword, resetPassword, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}