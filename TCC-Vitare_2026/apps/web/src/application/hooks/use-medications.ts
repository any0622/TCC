import { useState, useCallback } from 'react';
import { Medication } from '../../domain/entities';
import { medicationsApi } from '../../infrastructure/api/medications.api';

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMedications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await medicationsApi.findAllActive();
      setMedications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar medicamentos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createMedication = useCallback(async (data: { name: string; dosage: string; frequency: string; startDate: string; endDate?: string; notes?: string }) => {
    setError(null);
    try {
      const medication = await medicationsApi.create(data);
      setMedications((prev) => [medication, ...prev]);
      return medication;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar medicamento');
      return null;
    }
  }, []);

  const updateMedication = useCallback(async (id: string, data: Partial<Medication>) => {
    setError(null);
    try {
      const medication = await medicationsApi.update(id, data);
      setMedications((prev) => prev.map((m) => (m.id === id ? medication : m)));
      return medication;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar medicamento');
      return null;
    }
  }, []);

  const removeMedication = useCallback(async (id: string) => {
    setError(null);
    try {
      await medicationsApi.remove(id);
      setMedications((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover medicamento');
    }
  }, []);

  return {
    medications,
    isLoading,
    error,
    loadMedications,
    createMedication,
    updateMedication,
    removeMedication,
  };
}