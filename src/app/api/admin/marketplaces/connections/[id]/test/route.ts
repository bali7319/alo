import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { decryptMarketplaceCredentials } from '@/lib/marketplaces/credentials';
import { getMarketplaceAdapter } from '@/lib/marketplaces/adapters';
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

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  const { id } = await params;
  const storage = getMarketplaceStorage();
  const connection = await storage.getConnection(id);
  if (!connection) return NextResponse.json({ error: 'Bağlantı bulunamadı' }, { status: 404 });

  const credentials = decryptMarketplaceCredentials<any>(connection.credentialsEnc);
  const adapter = getMarketplaceAdapter(connection.provider);

  const startedAt = new Date();
  const result = await adapter.testConnection(credentials);

  await storage.updateConnection(id, {
    lastTestAt: startedAt.toISOString(),
    lastTestOk: result.ok,
    lastError: result.ok ? null : result.message || 'Test başarısız',
  });

  return NextResponse.json({ ok: result.ok, message: result.message });
}

