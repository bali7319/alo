/**
 * Cache Utility
 * Selective caching için basit in-memory cache (production için Redis önerilir)
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// In-memory cache store
const cacheStore = new Map<string, CacheEntry<any>>();

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

  return entry.data as T;
}

/**
 * Cache'e veri kaydeder
 */
export function setCache<T>(key: string, data: T, ttlMs: number = 60000): void {
  const expiresAt = Date.now() + ttlMs;
  cacheStore.set(key, { data, expiresAt });

  // Memory leak önleme - çok fazla entry varsa eski olanları temizle
  if (cacheStore.size > 1000) {
    const now = Date.now();
    const entries = Array.from(cacheStore.entries());
    for (const [k, v] of entries) {
      if (now > v.expiresAt) {
        cacheStore.delete(k);
      }
    }
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

