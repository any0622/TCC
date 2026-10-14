import {
  AxiosHeaders,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  clearIndexedDbScope,
  getIndexedDbCache,
  putIndexedDbCache,
} from "./indexed-db";

const CACHE_USER_SCOPE_KEY = "vitare:cache:userId";
const ANONYMOUS_SCOPE = "anonymous";
const DEFAULT_TTL_MS = 15 * 60 * 1000;
const DICTIONARY_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_OFFLINE_AGE_MS = 24 * 60 * 60 * 1000;

export function setOfflineCacheUserScope(userId: string): void {
  localStorage.setItem(CACHE_USER_SCOPE_KEY, userId);
}

export function getOfflineCacheUserScope(): string {
  return localStorage.getItem(CACHE_USER_SCOPE_KEY) ?? ANONYMOUS_SCOPE;
}

function buildCacheKey(url: string, params?: AxiosRequestConfig["params"]): string {
  const normalized = new URL(url, window.location.origin);
  if (params && typeof params === "object") {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      normalized.searchParams.set(key, String(value));
    }
  }

  return `${getOfflineCacheUserScope()}:GET:${normalized.pathname}${normalized.search}`;
}

function createCachedResponse<T>(
  data: T,
  config: AxiosRequestConfig,
  cachedAt: number,
): AxiosResponse<T> {
  const headers = new AxiosHeaders({
    "x-vitare-cache": "indexeddb",
    "x-vitare-cache-at": new Date(cachedAt).toISOString(),
  });

  return {
    data,
    status: 200,
    statusText: "OK (IndexedDB cache)",
    headers,
    config: config as InternalAxiosRequestConfig,
    request: undefined,
  };
}

export async function cachedGet<T>(
  url: string,
  request: () => Promise<AxiosResponse<T>>,
  config: AxiosRequestConfig = {},
  options: { ttlMs?: number; cache?: boolean; scope?: string } = {},
): Promise<AxiosResponse<T>> {
  const { ttlMs = DEFAULT_TTL_MS, cache = true, scope } = options;
  if (!cache || typeof window === "undefined") return request();

  const key = scope ? `${scope}:GET:${url}` : buildCacheKey(url, config.params);
  const now = Date.now();

  try {
    const response = await request();
    await putIndexedDbCache({
      key,
      scope: getOfflineCacheUserScope(),
      url,
      storedAt: now,
      expiresAt: now + ttlMs,
      data: response.data,
    });
    return response;
  } catch (error) {
    // Only network failures use the offline snapshot. HTTP errors such as
    // 401/403/404 must continue following the normal API error flow.
    const isNetworkFailure = !error || typeof error !== "object" || !("response" in error) || !(error as { response?: unknown }).response;
    if (!isNetworkFailure) throw error;

    const cached = await getIndexedDbCache<T>(key);
    if (!cached) throw error;

    const age = now - cached.storedAt;
    if (age > MAX_OFFLINE_AGE_MS) throw error;

    return createCachedResponse(cached.data, config, cached.storedAt);
  }
}

export async function invalidateCachedGet(url: string, params?: AxiosRequestConfig["params"]): Promise<void> {
  const key = buildCacheKey(url, params);
  const { deleteIndexedDbCache } = await import("./indexed-db");
  await deleteIndexedDbCache(key);
}

export async function clearPatientOfflineCache(): Promise<void> {
  const scope = getOfflineCacheUserScope();
  await clearIndexedDbScope(scope);
  localStorage.removeItem(CACHE_USER_SCOPE_KEY);
}

export const OFFLINE_CACHE_TTL = {
  standard: DEFAULT_TTL_MS,
  dictionary: DICTIONARY_TTL_MS,
};