import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Rate Limiting için basit middleware
 * Production için Redis kullanılmalı
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Eski entry'leri temizle (memory leak önleme)
function cleanupRateLimitMap(maxToScan: number = 500) {
  const now = Date.now();
  const entries = Array.from(rateLimitMap.entries());
  const limited = entries.slice(0, maxToScan);
  for (const [key, value] of limited) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

function checkRateLimit(ip: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  // Opportunistic cleanup (Edge-safe, no timers)
  if (rateLimitMap.size > 5000) cleanupRateLimitMap(2000);
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

  const render410Gone = () => {
    const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sayfa Kaldırıldı - Alo17</title>
  <meta name="robots" content="noindex, nofollow">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1rem; }
    .container { background: white; border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); padding: 2rem; max-width: 28rem; width: 100%; text-align: center; }
    .icon { width: 4rem; height: 4rem; background: #fed7aa; border-radius: 9999px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
    .icon svg { width: 2rem; height: 2rem; color: #ea580c; }
    h1 { font-size: 3.75rem; font-weight: 700; color: #ea580c; margin-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; font-weight: 700; color: #111827; margin-bottom: 0.5rem; }
    p { color: #4b5563; margin-bottom: 1.5rem; }
    .buttons { display: flex; flex-direction: column; gap: 0.75rem; }
    .btn { display: inline-block; padding: 0.75rem 1rem; border-radius: 0.5rem; text-decoration: none; font-weight: 500; transition: all 0.2s; }
    .btn-primary { background: #2563eb; color: white; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-outline { border: 1px solid #d1d5db; color: #374151; }
    .btn-outline:hover { background: #f9fafb; }
    .help { margin-top: 1.5rem; font-size: 0.875rem; color: #6b7280; }
    .help a { color: #2563eb; text-decoration: none; }
    .help a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
      </svg>
    </div>
    <h1>410</h1>
    <h2>Sayfa Kaldırıldı</h2>
    <p>Aradığınız sayfa kalıcı olarak kaldırılmıştır.</p>
    <div class="buttons">
      <a href="/" class="btn btn-primary">Ana Sayfaya Dön</a>
      <a href="/ilanlar" class="btn btn-outline">İlanları Görüntüle</a>
    </div>
    <div class="help">
      <p>Yardıma mı ihtiyacınız var?</p>
      <a href="/iletisim">Bizimle İletişime Geçin</a>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 410,
      statusText: 'Gone',
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  };

  // Eski URL pattern'lerini yönlendir (404 hatalarını önlemek için)
  // Bu pattern'ler Google Search Console'daki 404 hatalarını önlemek için
  const oldUrlPatterns = [
    // Eski sistem path'leri
    /^\/commodity\//,                    // /commodity/archives/lawsuits813812685264
    /^\/content\.php/,                    // /content.php?id=81277225285
    /^\/detail\.php/,                     // /detail.php?81277225285
    /^\/shop\//,                          // /shop/detial/g81277225285.html
    /^\/ctg\//,                           // /ctg/search/?ctgItemCd=81277225285
    /^\/shopping\//,                      // /shopping/search-word/list?q=81277225285
    /^\/products\//,                      // /products/81277225285
    /^\/p\//,                             // /p/shoppingcart/...
    
    // Sayısal ID'ler (eski sistem URL'leri)
    /^\/[0-9]{10,15}$/,                   // /81277225285 (10-15 haneli sayılar)
    /^\/[0-9]{10,15}\.(html|htm|phtml|shtml)$/, // /81277225285.html
    /^\/[0-9]{10,15}\.html$/,             // /81235625398.html
    /^\/[0-9]{10,15}\.htm$/,               // /814415161419.htm
    /^\/[0-9]{10,15}\.phtml$/,            // /81277225285.phtml
    /^\/[0-9]{10,15}\.shtml$/,            // /81225178059.shtml
    
    // Query string ile sayısal ID'ler
    /^\?[0-9]{10,15}$/,                   // ?81277225285
    /^\?s=[0-9]{10,15}$/,                 // ?s=81277225285
    /^\?commodity\//,                     // ?commodity/voice/concludes81193970314
    
    // Geçersiz karakterler
    /^\/(\$|&)$/,                         // /$ veya /&
    
    // Eski sistem query parametreleri
    /^\/shop\/goods_id=/,                 // /shop/goods_id=81277225285
    /^\/shop\/detial\//,                  // /shop/detial/g81277225285.html
  ];

  // ÖNEMLİ: www host'u için bile legacy/spam URL'lerde direkt 410 döndür.
  // Aksi halde www -> non-www 301 zinciri, GSC doğrulamasında "devam edilemiyor" hatasına yol açabiliyor.
  for (const pattern of oldUrlPatterns) {
    if (pattern.test(pathname)) {
      return render410Gone();
    }
  }

  // Query string kontrolü (eski sistem query parametreleri)
  const searchParams = request.nextUrl.searchParams;

  // Some spam/legacy URLs come as "/?81256378285" or "/detail.php?81256378285"
  // where the query has a numeric KEY and empty value. Catch those too.
  const numericKeyQuery = (() => {
    // If any query key is 10-15 digits, treat as legacy/spam
    for (const [key, value] of searchParams.entries()) {
      if (value === '' && /^[0-9]{10,15}$/.test(key)) return true;
    }
    return false;
  })();

  const hasOldQueryParams = 
    searchParams.has('id') && /^[0-9]{10,15}$/.test(searchParams.get('id') || '') ||
    searchParams.has('s') && /^[0-9]{10,15}$/.test(searchParams.get('s') || '') ||
    searchParams.has('ctgItemCd') && /^[0-9]{10,15}$/.test(searchParams.get('ctgItemCd') || '') ||
    searchParams.has('q') && /^[0-9]{10,15}$/.test(searchParams.get('q') || '') ||
    searchParams.has('goods_id') && /^[0-9]{10,15}$/.test(searchParams.get('goods_id') || '');

  if (hasOldQueryParams || numericKeyQuery) {
    return render410Gone();
  }

  // www.alo17.tr'den alo17.tr'ye yönlendirme (SEO için)
  // Tüm www. ile başlayan hostname'leri yakala
  if (hostname && hostname.startsWith('www.')) {
    const url = request.nextUrl.clone();
    url.hostname = hostname.replace(/^www\./, '');
    url.protocol = 'https:'; // HTTPS'e zorla
    return NextResponse.redirect(url, 301); // 301 Permanent Redirect
  }

  // Pathname kontrolü - Eski URL'ler için 410 Gone (kalıcı olarak silindi)
  // 410 Gone, Google'a bu URL'lerin artık mevcut olmadığını ve index'ten çıkarılması gerektiğini söyler
  for (const pattern of oldUrlPatterns) {
    if (pattern.test(pathname)) {
      return render410Gone();
    }
  }

  // Not: query-string legacy/spam kontrolü yukarıda yapılıyor.

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
      // GET isteği için herkes erişebilir, PUT için admin kontrolü route handler'da yapılıyor
      if (pathname.startsWith('/api/admin/settings')) {
        const limit = isAuthenticated ? 200 : 50; // Authenticated: 200, Anonymous: 50
        if (!checkRateLimit(ip, limit, 60000)) {
          return NextResponse.json(
            { error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.' },
            { status: 429 }
          );
        }
        // GET isteği için middleware'de 403 döndürme - route handler'a bırak
        // Middleware sadece rate limiting yapar
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

  // Logout parametresi kontrolü:
  // /giris?logout=true sayfasının açılmasına İZİN ver (cookie temizliği burada tamamlanıyor)
  // Diğer tüm sayfalarda logout=true varsa kullanıcıyı /giris?logout=true'ye taşı.
  const logoutParam = request.nextUrl.searchParams.get('logout');
  if (logoutParam === 'true') {
    if (pathname !== '/giris') {
      const loginUrl = new URL('/giris', request.url);
      loginUrl.searchParams.set('logout', 'true');
      return NextResponse.redirect(loginUrl);
    }
    // /giris?logout=true için devam et
  }

  // Onboarding: Google ile giriş yapan ve telefon numarası eksik olan kullanıcıyı
  // profili tamamlamaya zorla (admin/moderator hariç).
  // Not: DB sorgusu yapmadan, JWT token'dan kontrol edilir.
  // Allowlist: onboarding sırasında sadece profil düzenleme ve gerekli API'ler.
  {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const needsPhone = (token as any)?.needsPhone === true;
    const role = (token as any)?.role;

    if (needsPhone && role !== 'admin' && role !== 'moderator') {
      const allow =
        pathname === '/giris' ||
        pathname.startsWith('/api/auth/') ||
        pathname.startsWith('/api/logout') ||
        pathname.startsWith('/api/user/profile') ||
        pathname.startsWith('/profil/duzenle');

      if (!allow) {
        const requestedPath = request.nextUrl.pathname + request.nextUrl.search;
        const url = request.nextUrl.clone();
        url.pathname = '/profil/duzenle';
        url.searchParams.set('onboarding', '1');
        url.searchParams.set('callbackUrl', requestedPath);
        return NextResponse.redirect(url);
      }
    }
  }

  // Admin ve moderator route'ları için authentication kontrolü
  if (pathname.startsWith('/admin') || pathname.startsWith('/moderator')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      const loginUrl = new URL('/giris', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
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
  
  // Baseline security headers
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Origin-Agent-Cluster', '?1');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-site');
  
  // HTTPS zorunluluğu (production'da)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Performance headers
  // DNS prefetch
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  
  // Cache headers for static assets
  if (pathname.startsWith('/_next/static') || pathname.startsWith('/_next/image')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (pathname.startsWith('/api/')) {
    // API responses için kısa cache
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
  }
  
  // Resource hints - Preload critical resources (Next.js font loader zaten yapıyor, bu ekstra)
  // Font preload Next.js font loader tarafından otomatik yapılıyor

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
