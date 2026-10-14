import { staffApiClient } from "./staff-client.api";
import type { Staff, StaffTokenResponse } from "../types/api.types";

export const staffAuthApi = {
  getSetupStatus: () =>
    staffApiClient.get<{ setupRequired: boolean }>("/staff/auth/setup-status"),
  me: () => staffApiClient.get<Staff>("/staff/auth/me"),
  login: (data: { email: string; password: string }) =>
    staffApiClient.post<StaffTokenResponse>("/staff/auth/login", data),
  register: (data: {
    fullName: string;
    email: string;
    cpf: string;
    registrationNumber: string;
    role: string;
    password: string;
  }) => staffApiClient.post<StaffTokenResponse>("/staff/auth/register", data),
};