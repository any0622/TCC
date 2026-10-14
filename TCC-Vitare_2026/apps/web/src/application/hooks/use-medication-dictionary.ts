import { useState, useCallback, useMemo } from 'react';
import { MedicationDictionaryResult } from '../../domain/entities';
import { medicationDictionaryApi } from '../../infrastructure/api/medication-dictionary.api';

export function useMedicationDictionary() {
  const [results, setResults] = useState<MedicationDictionaryResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await medicationDictionaryApi.search(query);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar medicamentos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(
    () => {
      let timeout: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => search(query), 300);
      };
    },
    [search],
  );

  return {
    results,
    isLoading,
    error,
    search: debouncedSearch,
  };
}