import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Bazı tarayıcılar her zaman /favicon.ico ister.
// Projede SVG favicon kullandığımız için /favicon.ico isteğini /favicon.svg'ye yönlendiriyoruz.
export function GET(request: NextRequest) {
  const url = new URL('/favicon.svg', request.url);
  return NextResponse.redirect(url, {
    status: 307,
    headers: {
      // CDN/edge cache için
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}

