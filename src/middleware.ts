import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Rate Limiting için basit middleware
 * Production için Redis kullanılmalı
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Eski entry'leri temizle (memory leak önleme)
function cleanupRateLimitMap() {
  const now = Date.now();
  const entries = Array.from(rateLimitMap.entries());
  for (const [key, value] of entries) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Her 5 dakikada bir temizlik yap
setInterval(cleanupRateLimitMap, 5 * 60 * 1000);

function checkRateLimit(ip: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // NextRequest'te ip property yok, fallback olarak 'unknown' döndür
  return 'unknown';
}

export async function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // www.alo17.tr'den alo17.tr'ye yönlendirme (SEO için)
  if (hostname && (hostname.startsWith('www.') || hostname === 'www.alo17.tr')) {
    const url = request.nextUrl.clone();
    url.hostname = hostname.replace(/^www\./, '');
    return NextResponse.redirect(url, 301); // 301 Permanent Redirect
  }

  // Eski URL pattern'lerini yönlendir (404 hatalarını önlemek için)
  const oldUrlPatterns = [
    /^\/commodity\//,           // /commodity/...
    /^\/content\.php/,          // /content.php?id=...
    /^\/detail\.php/,            // /detail.php?...
    /^\/shop\//,                 // /shop/...
    /^\/ctg\//,                  // /ctg/search/...
    /^\/shopping\//,             // /shopping/...
    /^\/products\//,             // /products/...
    /^\/p\//,                    // /p/shoppingcart/...
    /^\/[0-9]+$/,                // Sadece sayılardan oluşan URL'ler (/81118738)
    /^\/[0-9]+\.(html|htm|phtml|shtml)$/, // /814715701988.html
    /^\/(\$|&)$/,                // /$ veya /& gibi geçersiz karakterler
  ];

  for (const pattern of oldUrlPatterns) {
    if (pattern.test(pathname)) {
      // Ana sayfaya yönlendir (301 Permanent Redirect)
      return NextResponse.redirect(new URL('/', request.url), 301);
    }
  }

  // API route'ları için rate limiting
  if (pathname.startsWith('/api/')) {
    // NextAuth endpoint'leri için rate limiting yok (çok sık çağrılıyor)
    // NextAuth kendi güvenlik mekanizmalarına sahip
    if (pathname.startsWith('/api/auth/')) {
      // NextAuth endpoint'leri için rate limiting devre dışı
      // Bu endpoint'ler NextAuth tarafından otomatik yönetiliyor
    } else {
      const ip = getClientIP(request);
      
      // Token kontrolü - authenticated kullanıcılar için daha yüksek limit
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      const isAuthenticated = !!token;
      
      // Admin ayarları endpoint'i için daha yüksek limit (sıkça çağrılıyor)
      if (pathname.startsWith('/api/admin/settings')) {
        const limit = isAuthenticated ? 200 : 50; // Authenticated: 200, Anonymous: 50
        if (!checkRateLimit(ip, limit, 60000)) {
          return NextResponse.json(
            { error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.' },
            { status: 429 }
          );
        }
      }
      // Diğer API endpoint'leri için normal limit
      else {
        const limit = isAuthenticated ? 200 : 100; // Authenticated: 200, Anonymous: 100
        if (!checkRateLimit(ip, limit, 60000)) {
          return NextResponse.json(
            { error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.' },
            { status: 429 }
          );
        }
      }
    }
  }

  // Admin ve moderator route'ları için authentication kontrolü
  if (pathname.startsWith('/admin') || pathname.startsWith('/moderator')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      const loginUrl = new URL('/giris', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin route'ları için admin kontrolü
    if (pathname.startsWith('/admin') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Moderator route'ları için moderator veya admin kontrolü
    if (pathname.startsWith('/moderator') && token.role !== 'moderator' && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Security headers ekle
  const response = NextResponse.next();
  
  // XSS koruması
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Clickjacking koruması
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Content type sniffing koruması
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HTTPS zorunluluğu (production'da)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
