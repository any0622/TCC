import { useState, useCallback } from 'react';
import { ChronicCondition } from '../../domain/entities';
import { conditionsApi } from '../../infrastructure/api/conditions.api';

export function useConditions() {
  const [conditions, setConditions] = useState<ChronicCondition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConditions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await conditionsApi.findAllActive();
      setConditions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar condições');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCondition = useCallback(async (data: { diseaseId: string; notes?: string; diagnosedAt?: string }) => {
    setError(null);
    try {
      const condition = await conditionsApi.create(data);
      setConditions((prev) => [condition, ...prev]);
      return condition;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar condição');
      return null;
    }
  }, []);

  const removeCondition = useCallback(async (id: string) => {
    setError(null);
    try {
      await conditionsApi.remove(id);
      setConditions((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover condição');
    }
  }, []);

  return {
    conditions,
    isLoading,
    error,
    loadConditions,
    createCondition,
    removeCondition,
  };
}