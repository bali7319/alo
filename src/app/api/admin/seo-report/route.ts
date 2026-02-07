import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { handleApiError } from '@/lib/api-error';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const KEY = 'seo_link_clicks_v1';

type ClickRow = {
  href: string;
  count: number;
  lastAt?: string;
  source?: string | null;
  listingId?: string | null;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const adminError = await requireAdmin(session);
    if (adminError) return adminError;

    const rec = await prisma.settings.findUnique({ where: { key: KEY } });
    let map: Record<string, any> = {};
    try {
      map = rec?.value ? JSON.parse(rec.value) : {};
    } catch {
      map = {};
    }

    const rows: ClickRow[] = Object.entries(map).map(([href, v]) => ({
      href,
      count: Number(v?.count ?? 0),
      lastAt: typeof v?.lastAt === 'string' ? v.lastAt : undefined,
      source: v?.source ?? null,
      listingId: v?.listingId ?? null,
    }));

    rows.sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

    return NextResponse.json({ rows, total: rows.length }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const adminError = await requireAdmin(session);
    if (adminError) return adminError;

    const confirm = req.nextUrl.searchParams.get('confirm');
    if (confirm !== '1') {
      return NextResponse.json({ error: 'confirm=1 gerekli' }, { status: 400 });
    }

    await prisma.settings.upsert({
      where: { key: KEY },
      update: { value: JSON.stringify({}) },
      create: { key: KEY, value: JSON.stringify({}) },
    });

    return NextResponse.json({ ok: true }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return handleApiError(error);
  }
}

