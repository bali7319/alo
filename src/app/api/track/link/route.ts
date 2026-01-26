import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSeoSettings } from '@/lib/seo-settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type LinkTrackPayload = {
  href: string;
  listingId?: string | null;
  source?: string | null;
  ts?: number;
};

function safeUrl(href: string) {
  try {
    const u = new URL(href);
    // cap length to prevent abuse
    return u.toString().slice(0, 2048);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const seo = await getSeoSettings();
  if (!seo.linkTracking) {
    return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
  }

  let body: LinkTrackPayload | null = null;
  try {
    body = (await req.json()) as LinkTrackPayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const href = safeUrl(String(body?.href ?? ''));
  if (!href) {
    return NextResponse.json({ ok: false, error: 'invalid_href' }, { status: 400 });
  }

  const listingId = body?.listingId ? String(body.listingId).slice(0, 64) : null;
  const source = body?.source ? String(body.source).slice(0, 64) : null;

  // Lightweight tracking without schema changes: aggregate counts in Settings table.
  // (If we later add a dedicated table, we can swap this implementation.)
  const key = 'seo_link_clicks_v1';
  try {
    const current = await prisma.settings.findUnique({ where: { key } });
    const map: Record<string, { count: number; lastAt: string; source?: string | null; listingId?: string | null }> =
      current?.value ? JSON.parse(current.value) : {};

    const existing = map[href] ?? { count: 0, lastAt: new Date(0).toISOString(), source: null, listingId: null };
    map[href] = {
      count: (existing.count ?? 0) + 1,
      lastAt: new Date().toISOString(),
      source,
      listingId,
    };

    await prisma.settings.upsert({
      where: { key },
      update: { value: JSON.stringify(map) },
      create: { key, value: JSON.stringify(map) },
    });
  } catch (e) {
    // Don't break UX if DB is down; just accept.
    console.error('[SEO] link track save error', e);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

