import { createContext } from "react";
import type { Staff } from "../lib/types/api.types";

export interface RegisterStaffData {
  fullName: string;
  email: string;
  cpf: string;
  registrationNumber: string;
  role: string;
  password: string;
}

export interface StaffAuthContextValue {
  staff: Staff | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterStaffData) => Promise<void>;
  logout: () => void;
}

export const StaffAuthContext = createContext<StaffAuthContextValue | null>(null);