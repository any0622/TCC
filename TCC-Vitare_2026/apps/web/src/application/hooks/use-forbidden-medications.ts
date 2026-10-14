import { useState, useCallback } from 'react';
import { ForbiddenMedication } from '../../domain/entities';
import { forbiddenMedicationsApi } from '../../infrastructure/api/forbidden-medications.api';

export function useForbiddenMedications() {
  const [items, setItems] = useState<ForbiddenMedication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await forbiddenMedicationsApi.findAll();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar medicamentos proibidos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createItem = useCallback(async (data: { medicationsDictionaryId: string; reason: string }) => {
    setError(null);
    try {
      const item = await forbiddenMedicationsApi.create(data);
      setItems((prev) => [item, ...prev]);
      return item;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar medicamento proibido');
      return null;
    }
  }, []);

  const removeItem = useCallback(async (id: string) => {
    setError(null);
    try {
      await forbiddenMedicationsApi.remove(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover medicamento proibido');
    }
  }, []);

  return {
    items,
    isLoading,
    error,
    loadItems,
    createItem,
    removeItem,
  };
}