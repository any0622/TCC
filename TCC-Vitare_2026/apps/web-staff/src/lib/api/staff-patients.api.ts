import { staffApiClient } from "./staff-client.api";
import type { PatientFullProfile } from "../types/api.types";

export const staffPatientsApi = {
  lookupByCpf: (cpf: string) =>
    staffApiClient.get<PatientFullProfile>("/staff/patients", {
      params: { cpf },
    }),
};