import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMarketplaceStorage } from '@/lib/marketplaces/storage';
import { decryptMarketplaceCredentials } from '@/lib/marketplaces/credentials';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

function maskSecret(value: string | undefined | null) {
  const v = (value || '').trim();
  if (!v) return '';
  const last = v.slice(-4);
  return `${'*'.repeat(Math.max(8, v.length - 4))}${last}`;
}

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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  const { provider } = await params;
  const storage = getMarketplaceStorage();
  const connections = await storage.listConnections();
  const connection = connections.find((c: any) => c.provider === provider) || null;

  if (!connection) return NextResponse.json({ connection: null, credentials: null });

  let creds: any;
  try {
    creds = decryptMarketplaceCredentials<any>((connection as any).credentialsEnc);
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    return NextResponse.json(
      {
        error: 'Credential çözülemedi. Sunucuda ENCRYPTION_KEY sabit mi? Entegrasyonu silip yeniden kaydedin.',
        code: 'DECRYPT_FAILED',
        details: msg,
      },
      { status: 500 }
    );
  }

  const baseUrl = (creds?.baseUrl || '').trim();
  const key = (creds?.consumerKey || creds?.key || '').trim();
  const secret = (creds?.consumerSecret || creds?.secret || '').trim();

  return NextResponse.json({
    connection: {
      id: (connection as any).id,
      provider: (connection as any).provider,
      isActive: (connection as any).isActive,
      lastTestAt: (connection as any).lastTestAt,
      lastTestOk: (connection as any).lastTestOk,
      lastError: (connection as any).lastError,
      createdAt: (connection as any).createdAt,
      updatedAt: (connection as any).updatedAt,
    },
    credentials: {
      baseUrl,
      keyMasked: maskSecret(key),
      secretMasked: maskSecret(secret),
    },
  });
}

