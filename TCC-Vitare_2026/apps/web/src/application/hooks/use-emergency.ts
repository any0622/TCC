import { useState, useCallback } from 'react';
import { EmergencyEvent } from '../../domain/entities';
import { emergencyApi } from '../../infrastructure/api/emergency.api';
import { generateIdempotencyKey } from '../../infrastructure/api/geolocation';
import { getCurrentPosition } from '../../infrastructure/api/geolocation';

export function useEmergency() {
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
        const data = await emergencyApi.findAll();
        setEmergencies(data);
        setHasMore(false);
      } else {
        const result = await emergencyApi.findAllWithCursor(nextCursor || undefined, 20);
        setEmergencies((prev) => [...prev, ...result.data]);
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar emergências');
    } finally {
      setIsLoading(false);
    }
  }, [nextCursor, isLoading]);

  const triggerEmergency = useCallback(async (useLocation = true): Promise<EmergencyEvent | null> => {
    setError(null);
    let latitude: number | undefined;
    let longitude: number | undefined;

    if (useLocation) {
      try {
        const coords = await getCurrentPosition();
        latitude = coords.latitude;
        longitude = coords.longitude;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao obter localização');
        return null;
      }
    }

    const idempotencyKey = generateIdempotencyKey();

    try {
      const emergency = await emergencyApi.trigger({ latitude, longitude, idempotencyKey });
      setEmergencies((prev) => [emergency, ...prev]);
      return emergency;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao acionar emergência');
      return null;
    }
  }, []);

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
    triggerEmergency,
  };
}