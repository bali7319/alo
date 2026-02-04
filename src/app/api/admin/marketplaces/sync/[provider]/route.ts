import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMarketplaceStorage } from '@/lib/marketplaces/storage';
import { decryptMarketplaceCredentials } from '@/lib/marketplaces/credentials';
import { getMarketplaceAdapter } from '@/lib/marketplaces/adapters';

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

export async function POST(_req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  const { provider } = await params;
  const storage = getMarketplaceStorage();
  const connection = await storage.getConnectionByProvider(provider as any);
  if (!connection) return NextResponse.json({ error: 'Bu pazaryeri için bağlantı yok' }, { status: 404 });

  const creds = decryptMarketplaceCredentials<any>(connection.credentialsEnc);
  const adapter = getMarketplaceAdapter(connection.provider);

  if (!adapter.listProducts || !adapter.listOrders) {
    return NextResponse.json({ error: `${provider} sync henüz hazır değil` }, { status: 400 });
  }

  try {
    const [productsUpserts, ordersUpserts] = await Promise.all([
      adapter.listProducts(creds),
      adapter.listOrders(creds),
    ]);

    const connectionInfo = { id: connection.id, provider: connection.provider, name: connection.name };

    const products = (productsUpserts || []).map((p) => ({
      id: `${connection.id}:${p.externalId}`,
      connectionId: connection.id,
      externalId: p.externalId,
      merchantSku: p.merchantSku ?? null,
      barcode: p.barcode ?? null,
      title: p.title ?? null,
      price: p.price != null ? String(p.price) : null,
      currency: p.currency || 'TRY',
      stock: typeof p.stock === 'number' ? p.stock : null,
      updatedAt: new Date().toISOString(),
      connection: connectionInfo,
      raw: p.raw ?? null,
    }));

    const orders = (ordersUpserts || []).map((o) => ({
      id: `${connection.id}:${o.externalId}`,
      connectionId: connection.id,
      externalId: o.externalId,
      status: o.status,
      placedAt: o.placedAt ? new Date(o.placedAt as any).toISOString() : null,
      buyerName: o.buyerName ?? null,
      buyerEmail: o.buyerEmail ?? null,
      shippingName: o.shippingName ?? null,
      shippingCity: o.shippingCity ?? null,
      shippingDistrict: o.shippingDistrict ?? null,
      totalAmount: o.totalAmount != null ? String(o.totalAmount) : null,
      currency: o.currency || 'TRY',
      connection: connectionInfo,
      items: Array.isArray(o.items)
        ? o.items.map((it, idx) => ({
            id: `${connection.id}:${o.externalId}:${it.externalId || idx}`,
            title: it.title ?? null,
            quantity: typeof it.quantity === 'number' ? it.quantity : 1,
            merchantSku: it.merchantSku ?? null,
            barcode: it.barcode ?? null,
            unitPrice: it.unitPrice != null ? String(it.unitPrice) : null,
            totalPrice: it.totalPrice != null ? String(it.totalPrice) : null,
            currency: it.currency || o.currency || 'TRY',
          }))
        : [],
      labels: [],
      eInvoice: null,
      raw: o.raw ?? null,
    }));

    await storage.replaceProductsForConnection(connection.id, products);
    await storage.replaceOrdersForConnection(connection.id, orders);

    await storage.updateConnection(connection.id, {
      lastTestAt: new Date().toISOString(),
      lastTestOk: true,
      lastError: null,
    });

    return NextResponse.json({ ok: true, products: products.length, orders: orders.length });
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    await storage.updateConnection(connection.id, {
      lastTestAt: new Date().toISOString(),
      lastTestOk: false,
      lastError: msg,
    });
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

