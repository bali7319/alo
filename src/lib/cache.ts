/**
 * Cache Utility
 * Selective caching için basit in-memory cache (production için Redis önerilir)
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// In-memory cache store
const cacheStore = new Map<string, CacheEntry<unknown>>();
const CACHE_MAX_ENTRIES = 1000;

/**
 * Cache'den veri alır
 */
export function getCache<T>(key: string): T | null {
  const entry = cacheStore.get(key);
  
  if (!entry) {
    return null;
  }

  // Süresi dolmuşsa sil ve null döndür
  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }

  // LRU-ish: access refreshes insertion order
  cacheStore.delete(key);
  cacheStore.set(key, entry);

  return entry.data as T;
}

/**
 * Cache'e veri kaydeder
 */
export function setCache<T>(key: string, data: T, ttlMs: number = 60000): void {
  const expiresAt = Date.now() + ttlMs;
  // refresh order
  if (cacheStore.has(key)) cacheStore.delete(key);
  cacheStore.set(key, { data, expiresAt });

  // Memory boundedness: evict expired, then oldest
  if (cacheStore.size > CACHE_MAX_ENTRIES) {
    const now = Date.now();
    for (const [k, v] of cacheStore.entries()) {
      if (now > v.expiresAt) cacheStore.delete(k);
      if (cacheStore.size <= CACHE_MAX_ENTRIES) break;
    }
  }
  while (cacheStore.size > CACHE_MAX_ENTRIES) {
    const oldestKey = cacheStore.keys().next().value as string | undefined;
    if (!oldestKey) break;
    cacheStore.delete(oldestKey);
  }
}

/**
 * Cache'den veri siler
 */
export function deleteCache(key: string): void {
  cacheStore.delete(key);
}

/**
 * Belirli pattern'e uyan tüm cache'leri temizler
 */
export function clearCachePattern(pattern: string): void {
  const keys = Array.from(cacheStore.keys());
  for (const key of keys) {
    if (key.includes(pattern)) {
      cacheStore.delete(key);
    }
  }
}

/**
 * Tüm cache'i temizler
 */
export function clearAllCache(): void {
  cacheStore.clear();
}

/**
 * Cache key oluşturur
 */
export function createCacheKey(...parts: (string | number)[]): string {
  return parts.join(':');
}

