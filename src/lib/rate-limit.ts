/**
 * Rate Limiting Utility
 * Basit in-memory rate limiting (production için Redis önerilir)
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (production için Redis kullanılmalı)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limit kontrolü yapar
 * @param identifier - Rate limit için unique identifier (IP, user ID, etc.)
 * @param maxRequests - Maksimum istek sayısı
 * @param windowMs - Zaman penceresi (milisaniye)
 * @returns { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 dakika
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Entry yoksa veya süresi dolmuşsa yeni entry oluştur
  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs;
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });

    // Eski entry'leri temizle (memory leak önleme)
    if (rateLimitStore.size > 10000) {
      const entries = Array.from(rateLimitStore.entries());
      for (const [key, value] of entries) {
        if (now > value.resetTime) {
          rateLimitStore.delete(key);
        }
      }
    }

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime,
    };
  }

  // Entry var ve süresi dolmamış
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // İsteğe izin ver, sayacı artır
  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * IP adresini request'ten alır
 */
export function getClientIP(request: Request): string {
  // X-Forwarded-For header'ından IP al (proxy/load balancer arkasında)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // X-Real-IP header'ından IP al
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback: 'unknown'
  return 'unknown';
}

