import { useState, useCallback } from 'react';
import { EmergencyEvent } from '../../domain/entities';
import { emergenciesApi } from '../../infrastructure/api/emergencies.api';

export function useEmergenciesFeed() {
  const [emergencies, setEmergencies] = useState<EmergencyEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const loadEmergencies = useCallback(async (reset = false) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      if (reset) {
        setNextCursor(null);
      }
      const result = await emergenciesApi.findAll(nextCursor || undefined, 20);
      setEmergencies((prev) => (reset ? result.data : [...prev, ...result.data]));
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar emergências');
    } finally {
      setIsLoading(false);
    }
  }, [nextCursor, isLoading]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadEmergencies(false);
    }
  }, [hasMore, isLoading, loadEmergencies]);

  return {
    emergencies,
    isLoading,
    error,
    hasMore,
    loadEmergencies: () => loadEmergencies(true),
    loadMore,
  };
}