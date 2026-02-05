import { NextRequest, NextResponse } from 'next/server';
import type { MarketplaceProvider } from '@prisma/client';

import { requireMarketplaceAgent } from '@/lib/marketplaces/agentAuth';
import { getMarketplaceStorage } from '@/lib/marketplaces/storage';
import { decryptMarketplaceCredentials } from '@/lib/marketplaces/credentials';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const AllowedProviders = new Set<MarketplaceProvider>(['woocommerce', 'trendyol', 'hepsiburada', 'n11', 'pazarama'] as any);

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const auth = requireMarketplaceAgent(req);
  if (!auth.ok) return auth.res;

  const { provider } = await params;
  if (!AllowedProviders.has(provider as MarketplaceProvider)) {
    return NextResponse.json({ error: 'Geçersiz provider' }, { status: 400 });
  }

  const storage = getMarketplaceStorage();
  const connection = await storage.getConnectionByProvider(provider as MarketplaceProvider);
  if (!connection) return NextResponse.json({ error: 'Bu provider için bağlantı yok' }, { status: 404 });

  if (!connection.isActive) {
    return NextResponse.json({ error: 'Bu provider bağlantısı pasif' }, { status: 409 });
  }

  let credentials: any;
  try {
    credentials = decryptMarketplaceCredentials<any>(connection.credentialsEnc);
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    return NextResponse.json(
      {
        error: 'Credential çözülemedi. ENCRYPTION_KEY sabit mi? Panelde entegrasyonu tekrar kaydedin.',
        details: msg,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    provider: connection.provider,
    connection: {
      id: connection.id,
      name: connection.name,
      isActive: connection.isActive,
      lastTestAt: connection.lastTestAt,
      lastTestOk: connection.lastTestOk,
      lastError: connection.lastError,
      updatedAt: connection.updatedAt,
    },
    credentials,
  });
}

