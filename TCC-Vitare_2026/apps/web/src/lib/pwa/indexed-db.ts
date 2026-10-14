const DB_NAME = "vitare-pwa-cache";
const DB_VERSION = 1;
const STORE_NAME = "responses";

export interface IndexedDbCacheRecord<T = unknown> {
  key: string;
  scope: string;
  url: string;
  storedAt: number;
  expiresAt: number;
  data: T;
}

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB não está dispon�vel neste navegador."));
  }

  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error ?? new Error("Falha ao abrir o IndexedDB."));
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (db.objectStoreNames.contains(STORE_NAME)) return;

      const store = db.createObjectStore(STORE_NAME, { keyPath: "key" });
      store.createIndex("scope", "scope", { unique: false });
      store.createIndex("expiresAt", "expiresAt", { unique: false });
    };
  });

  return databasePromise;
}

export async function putIndexedDbCache<T>(record: IndexedDbCacheRecord<T>): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(record);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error ?? new Error("Transação IndexedDB abortada."));
    });
  } catch (error) {
    // Cache failure must never break the network-first application flow.
    console.warn("Vitare: não foi poss�vel gravar o cache IndexedDB.", error);
  }
}

export async function getIndexedDbCache<T>(key: string): Promise<IndexedDbCacheRecord<T> | null> {
  try {
    const db = await openDatabase();
    return await new Promise<IndexedDbCacheRecord<T> | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve((request.result as IndexedDbCacheRecord<T> | undefined) ?? null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("Vitare: não foi poss�vel ler o cache IndexedDB.", error);
    return null;
  }
}

export async function deleteIndexedDbCache(key: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.warn("Vitare: não foi poss�vel remover um item do cache IndexedDB.", error);
  }
}

export async function clearIndexedDbScope(scope: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.index("scope").openCursor(IDBKeyRange.only(scope));

      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        cursor.delete();
        cursor.continue();
      };
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error ?? new Error("Limpeza IndexedDB abortada."));
    });
  } catch (error) {
    console.warn("Vitare: não foi poss�vel limpar o cache IndexedDB.", error);
  }
}