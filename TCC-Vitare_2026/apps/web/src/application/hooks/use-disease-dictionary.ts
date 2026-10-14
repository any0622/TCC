import { useState, useCallback, useMemo } from 'react';
import { DiseaseDictionaryResult } from '../../domain/entities';
import { diseaseDictionaryApi } from '../../infrastructure/api/disease-dictionary.api';

export function useDiseaseDictionary() {
  const [results, setResults] = useState<DiseaseDictionaryResult[]>([]);
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
      const data = await diseaseDictionaryApi.search(query);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar doenças');
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