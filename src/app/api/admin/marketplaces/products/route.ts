import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMarketplaceStorage } from '@/lib/marketplaces/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user?.email) {
    return { ok: false as const, res: NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 }) };
  }
  if (role !== 'admin') {
    return { ok: false as const, res: NextResponse.json({ error: 'Bu işlem için admin yetkisi gerekiyor' }, { status: 403 }) };
  }
  return { ok: true as const, session };
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  const sp = req.nextUrl.searchParams;
  const connectionId = sp.get('connectionId');
  const q = (sp.get('q') || '').trim();
  const take = Math.min(200, Math.max(1, parseInt(sp.get('limit') || '50', 10)));

  try {
    const storage = getMarketplaceStorage();
    const products = await storage.listProducts({ connectionId: connectionId || undefined, q, limit: take });
    return NextResponse.json({ products });
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    return NextResponse.json(
      { error: 'Ürünler yüklenemedi', code: 'STORAGE_ERROR', details: msg },
      { status: 500 }
    );
  }
}

