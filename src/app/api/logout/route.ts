import { NextRequest, NextResponse } from 'next/server';

function serializeDeletionCookie(opts: {
  name: string;
  path: string;
  domain?: string;
  secure: boolean;
}) {
  // Expire immediately + Max-Age=0 for compatibility
  const base = [`${opts.name}=`, `Path=${opts.path}`, 'Expires=Thu, 01 Jan 1970 00:00:00 GMT', 'Max-Age=0', 'HttpOnly', 'SameSite=Lax'];
  if (opts.domain) base.push(`Domain=${opts.domain}`);
  if (opts.secure) base.push('Secure');
  return base.join(';\x20');
}

function buildCookieDeletionResponse(redirectUrl: string) {
  // Bazı reverse proxy/edge katmanları 30x response'larda Set-Cookie'yi problemli işleyebiliyor.
  // Bu yüzden 200 HTML döndürüp, cookie'leri sildikten sonra client-side redirect yapıyoruz.
  // Tam URL kullanarak meta refresh ve script redirect'in her ortamda çalışması sağlanır.
  const escapedUrl = redirectUrl.replace(/"/g, '&quot;');
  const html = `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0;url=${escapedUrl}" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Yönlendiriliyor</title>
  </head>
  <body>
    <script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
  </body>
</html>`;

  const response = new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });

  // Nginx bazı durumlarda çok büyük header setlerinde 502 döndürebiliyor.
  // Logout için minimum gerekli olan session cookie'lerini temizlemek yeterli.
  const isProduction = process.env.NODE_ENV === 'production';
  const secure = isProduction; // prod'da true olmalı

  const minimalCookieNames = [
    // NextAuth/Auth.js session token cookie'leri
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    '__Host-next-auth.session-token',
    'authjs.session-token',
  ];

  for (const name of minimalCookieNames) {
    // __Host- cookie'lerde Domain OLAMAZ, Path=/ olmalı
    if (name.startsWith('__Host-')) {
      response.headers.append('Set-Cookie', serializeDeletionCookie({ name, path: '/', secure: true }));
      continue;
    }

    // Domain'siz varyasyon (bazı ortamlarda cookie domain'siz set edilebiliyor)
    response.headers.append('Set-Cookie', serializeDeletionCookie({ name, path: '/', secure }));

    // Ana domain varyasyonları
    response.headers.append('Set-Cookie', serializeDeletionCookie({ name, path: '/', domain: 'alo17.tr', secure }));
    response.headers.append('Set-Cookie', serializeDeletionCookie({ name, path: '/', domain: '.alo17.tr', secure }));
  }

  return response;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const next = url.searchParams.get('next') || '/';

  // Only allow same-origin relative redirects
  const safePath = next.startsWith('/') ? next : '/';
  // Tam URL ile yönlendirme. Production'da anasayfa (/) için NEXTAUTH_URL kullan ki her zaman https://alo17.tr/ açılsın
  const baseUrl = process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL && safePath === '/'
    ? process.env.NEXTAUTH_URL.replace(/\/$/, '')
    : (url.origin || process.env.NEXTAUTH_URL ?? '');
  const redirectUrl = baseUrl ? `${baseUrl}${safePath}` : safePath;
  return buildCookieDeletionResponse(redirectUrl);
}

export async function POST(request: NextRequest) {
  return GET(request);
}

