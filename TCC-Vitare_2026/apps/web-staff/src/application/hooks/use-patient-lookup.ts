import { useState, useCallback } from 'react';
import { PatientLookupResult } from '../../domain/entities';
import { patientLookupApi } from '../../infrastructure/api/patient-lookup.api';

export function usePatientLookup() {
  const [result, setResult] = useState<PatientLookupResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchByCPF = useCallback(async (cpf: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await patientLookupApi.searchByCPF(cpf);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar paciente');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchByName = useCallback(async (name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await patientLookupApi.searchByName(name);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar paciente');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    isLoading,
    error,
    searchByCPF,
    searchByName,
    clear,
  };
}