import { NextRequest, NextResponse } from 'next/server';

function buildCookieDeletionResponse(nextPath: string) {
  // Relative redirect: prod'da Host yanlış (localhost) görünebilse bile
  // tarayıcı mevcut origin üzerinde kalır (örn. alo17.tr).
  const response = new NextResponse(null, {
    status: 302,
    headers: {
      Location: nextPath,
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
    // Default delete
    response.cookies.delete(name);

    for (const path of paths) {
      for (const domain of domains) {
        response.cookies.set(name, '', {
          value: '',
          expires: new Date(0),
          httpOnly: true,
          secure: isProduction,
          sameSite: 'lax',
          path,
          ...(domain ? { domain } : {}),
        });
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

