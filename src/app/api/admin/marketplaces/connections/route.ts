import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { encryptMarketplaceCredentials } from '@/lib/marketplaces/credentials';
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

const CreateConnectionSchema = z.object({
  provider: z.enum(['trendyol', 'hepsiburada', 'n11', 'pazarama', 'woocommerce']),
  name: z.string().trim().min(2).max(64),
  isActive: z.boolean().optional().default(true),
  credentials: z.unknown().optional().default({}),
  credentialsHint: z.string().trim().max(200).optional(),
  metadata: z.unknown().optional(),
});

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  const storage = getMarketplaceStorage();
  const connections = await storage.listConnections();

  return NextResponse.json({ connections });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  const body = await req.json().catch(() => null);
  const parsed = CreateConnectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Geçersiz istek', details: parsed.error.flatten() }, { status: 400 });
  }

  const { provider, name, isActive, credentials, credentialsHint, metadata } = parsed.data;
  const credentialsEnc = encryptMarketplaceCredentials(credentials);

  try {
    const storage = getMarketplaceStorage();
    const created = await storage.createConnection({
      provider,
      name,
      isActive,
      credentialsEnc,
      credentialsHint: credentialsHint || null,
      metadata: (metadata ?? null) as any,
    });

    return NextResponse.json({ connection: created }, { status: 201 });
  } catch (e: any) {
    // unique(provider, name) constraint
    return NextResponse.json(
      { error: 'Bağlantı oluşturulamadı', details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}

