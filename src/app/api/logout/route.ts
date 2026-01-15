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

function buildCookieDeletionResponse(nextPath: string) {
  // Bazı reverse proxy/edge katmanları 30x response'larda Set-Cookie'yi problemli işleyebiliyor.
  // Bu yüzden 200 HTML döndürüp, cookie'leri sildikten sonra client-side redirect yapıyoruz.
  // Böylece cookie silme tarayıcı tarafından kesin uygulanır.
  const html = `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0;url=${nextPath}" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Çıkış yapılıyor…</title>
  </head>
  <body>
    <p>Çıkış yapılıyor…</p>
    <script>
      window.location.replace(${JSON.stringify(nextPath)});
    </script>
  </body>
</html>`;

  const response = new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });

  const cookieNames = [
    // NextAuth/Auth.js session + csrf
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    '__Host-next-auth.session-token',
    'authjs.session-token',
    'next-auth.csrf-token',
    '__Secure-next-auth.csrf-token',
    '__Host-next-auth.csrf-token',
    'authjs.csrf-token',

    // callback / pkce helpers
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url',
    '__Host-next-auth.callback-url',
    'next-auth.pkce.code_verifier',
    '__Secure-next-auth.pkce.code_verifier',
    '__Host-next-auth.pkce.code_verifier',
  ];

  const isProduction = process.env.NODE_ENV === 'production';
  const domains: Array<string | undefined> = [undefined, 'alo17.tr', '.alo17.tr'];
  const paths = ['/', '/admin', '/api'];

  for (const name of cookieNames) {
    // Not: NextResponse.cookies.set aynı isimli cookie'leri overwrite edebiliyor;
    // bu yüzden header'a manuel append yapıyoruz (Path=/ ve Domain varyasyonları için).
    for (const path of paths) {
      for (const domain of domains) {
        response.headers.append(
          'Set-Cookie',
          serializeDeletionCookie({ name, path, domain, secure: isProduction })
        );
      }
    }
  }

  return response;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const next = url.searchParams.get('next') || '/giris?logout=true';

  // Only allow same-origin relative redirects
  const safeNext = next.startsWith('/') ? next : '/giris?logout=true';
  return buildCookieDeletionResponse(safeNext);
}

export async function POST(request: NextRequest) {
  return GET(request);
}

