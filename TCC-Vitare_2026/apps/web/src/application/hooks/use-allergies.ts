import { useState, useCallback } from 'react';
import { Allergy } from '../../domain/entities';
import { allergiesApi } from '../../infrastructure/api/allergies.api';

export function useAllergies() {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAllergies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await allergiesApi.findAll();
      setAllergies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar alergias');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAllergy = useCallback(async (data: { name: string; severity?: string; notes?: string }) => {
    setError(null);
    try {
      const allergy = await allergiesApi.create(data);
      setAllergies((prev) => [allergy, ...prev]);
      return allergy;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar alergia');
      return null;
    }
  }, []);

  const removeAllergy = useCallback(async (id: string) => {
    setError(null);
    try {
      await allergiesApi.remove(id);
      setAllergies((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover alergia');
    }
  }, []);

  return {
    allergies,
    isLoading,
    error,
    loadAllergies,
    createAllergy,
    removeAllergy,
  };
}