import { staffApiClient } from './client';
import { PatientLookupResult } from '../../domain/entities';

export const patientLookupApi = {
  async searchByCPF(cpf: string): Promise<PatientLookupResult> {
    return staffApiClient.get(`/staff/patients/lookup?cpf=${encodeURIComponent(cpf)}`);
  },

  async searchByName(name: string): Promise<PatientLookupResult> {
    return staffApiClient.get(`/staff/patients/lookup?name=${encodeURIComponent(name)}`);
  },
};