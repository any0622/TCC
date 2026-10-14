import { getPendingOperations, removePendingOperation } from './indexed-db';
import { apiClient } from '../api/client';

export async function syncPendingOperations(): Promise<void> {
  const operations = await getPendingOperations();

  for (const operation of operations) {
    try {
      const config: any = {};
      if (operation.idempotencyKey) {
        config.headers = { 'X-Idempotency-Key': operation.idempotencyKey };
      }

      switch (operation.type) {
        case 'create':
          await apiClient.post(operation.endpoint, operation.data, config);
          break;
        case 'update':
          await apiClient.put(operation.endpoint, operation.data, config);
          break;
        case 'delete':
          await apiClient.delete(operation.endpoint, config);
          break;
      }

      await removePendingOperation(operation.id);
    } catch (error) {
      console.error('Failed to sync operation:', operation, error);
    }
  }
}

export function registerSyncListener(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data === 'sync') {
        syncPendingOperations();
      }
    });
  }

  window.addEventListener('online', () => {
    syncPendingOperations();
  });
}