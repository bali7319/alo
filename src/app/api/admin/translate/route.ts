import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin';
import { handleApiError } from '@/lib/api-error';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Body = {
  text?: string;
  texts?: string[];
  from?: string; // default tr
  to?: string; // default en
};

async function translateOne(text: string, from: string, to: string) {
  // Unofficial Google Translate endpoint (no API key). Works for many setups but may fail in some networks.
  const url =
    'https://translate.googleapis.com/translate_a/single' +
    `?client=gtx&sl=${encodeURIComponent(from)}&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text)}`;

  const r = await fetch(url, {
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0' },
    cache: 'no-store',
  });

  if (!r.ok) throw new Error(`Çeviri servisi hata verdi (${r.status})`);

  const data = (await r.json()) as any;
  const translatedText = Array.isArray(data?.[0])
    ? data[0].map((x: any) => (Array.isArray(x) ? x[0] : '')).join('')
    : '';

  return translatedText || '';
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const adminError = await requireAdmin(session);
  if (adminError) return adminError;

  let body: Body | null = null;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }

  const from = (body?.from ?? 'tr').toString();
  const to = (body?.to ?? 'en').toString();

  const textsArr = Array.isArray(body?.texts) ? body!.texts!.map((t) => (t ?? '').toString()) : null;
  const text = (body?.text ?? '').toString();
  try {
    if (textsArr) {
      const joined = textsArr.join('\n<<<ALO17_SPLIT>>>\n');
      if (!joined.trim()) return NextResponse.json({ translatedTexts: textsArr.map(() => '') }, { status: 200 });
      if (joined.length > 6000) {
        return NextResponse.json({ error: 'Metin çok uzun (toplam max 6000 karakter).' }, { status: 400 });
      }

      const translatedJoined = await translateOne(joined, from, to);
      const parts = translatedJoined.split('\n<<<ALO17_SPLIT>>>\n');

      // If delimiter got mangled, fall back to per-item translation
      if (parts.length !== textsArr.length) {
        const translatedTexts = await Promise.all(
          textsArr.map(async (t) => {
            if (!t.trim()) return '';
            if (t.length > 6000) return '';
            try {
              return await translateOne(t, from, to);
            } catch {
              return '';
            }
          })
        );
        return NextResponse.json({ translatedTexts }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
      }

      return NextResponse.json({ translatedTexts: parts }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
    }

    if (!text.trim()) return NextResponse.json({ translatedText: '' }, { status: 200 });
    if (text.length > 6000) {
      return NextResponse.json({ error: 'Metin çok uzun (max 6000 karakter).' }, { status: 400 });
    }

    const translatedText = await translateOne(text, from, to);
    return NextResponse.json({ translatedText }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return handleApiError(e);
  }
}

