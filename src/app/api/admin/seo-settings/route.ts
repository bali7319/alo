import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAdminEmail } from '@/lib/admin';
import { getSeoSettings, setSeoSettings } from '@/lib/seo-settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { ok: false as const, status: 401 as const, error: 'Oturum açmanız gerekiyor' };

  // Prefer role from session if present
  const userRole = (session.user as any)?.role;
  if (userRole === 'admin') return { ok: true as const, session };

  // Fallback: DB role, then allowlist
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    if (user?.role === 'admin') return { ok: true as const, session };
  } catch {
    // ignore
  }

  if (isAdminEmail(session.user.email)) return { ok: true as const, session };
  return { ok: false as const, status: 403 as const, error: 'Yetkiniz yok. Sadece admin bu işlemi yapabilir.' };
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const settings = await getSeoSettings();
  return NextResponse.json(settings, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }

  const patch = {
    internalLinking: typeof body?.internalLinking === 'boolean' ? body.internalLinking : undefined,
    linkTracking: typeof body?.linkTracking === 'boolean' ? body.linkTracking : undefined,
  };

  const next = await setSeoSettings(patch);
  return NextResponse.json(next, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}

