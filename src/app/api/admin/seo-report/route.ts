import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAdminEmail } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { ok: false as const, status: 401 as const, error: 'Oturum açmanız gerekiyor' };

  const userRole = (session.user as any)?.role;
  if (userRole === 'admin') return { ok: true as const };

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true } });
    if (user?.role === 'admin') return { ok: true as const };
  } catch {
    // ignore
  }

  if (isAdminEmail(session.user.email)) return { ok: true as const };
  return { ok: false as const, status: 403 as const, error: 'Yetkiniz yok. Sadece admin bu işlemi yapabilir.' };
}

const KEY = 'seo_link_clicks_v1';

type ClickRow = {
  href: string;
  count: number;
  lastAt?: string;
  source?: string | null;
  listingId?: string | null;
};

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

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
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

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
}

