import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { MarketplaceProvider } from '@prisma/client';

import { requireMarketplaceAgent } from '@/lib/marketplaces/agentAuth';
import { getMarketplaceStorage } from '@/lib/marketplaces/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const AllowedProviders = new Set<MarketplaceProvider>(['woocommerce', 'trendyol', 'hepsiburada', 'n11', 'pazarama'] as any);

const IngestSchema = z.object({
  productsUpserts: z.array(z.any()).optional().default([]),
  ordersUpserts: z.array(z.any()).optional().default([]),
  // optional metadata
  fetchedAt: z.string().optional(),
  agentVersion: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const auth = requireMarketplaceAgent(req);
  if (!auth.ok) return auth.res;

  const { provider } = await params;
  if (!AllowedProviders.has(provider as MarketplaceProvider)) {
    return NextResponse.json({ error: 'Geçersiz provider' }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = IngestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Geçersiz istek', details: parsed.error.flatten() }, { status: 400 });
  }

  const storage = getMarketplaceStorage();
  const connection = await storage.getConnectionByProvider(provider as MarketplaceProvider);
  if (!connection) return NextResponse.json({ error: 'Bu provider için bağlantı yok' }, { status: 404 });

  const productsUpserts = parsed.data.productsUpserts || [];
  const ordersUpserts = parsed.data.ordersUpserts || [];

  // Basic guardrails (avoid accidentally posting massive payloads)
  if (productsUpserts.length > 10000 || ordersUpserts.length > 5000) {
    return NextResponse.json({ error: 'Payload çok büyük' }, { status: 413 });
  }

  const connectionInfo = { id: connection.id, provider: connection.provider, name: connection.name };

  try {
    const products = (productsUpserts || []).map((p: any) => ({
      id: `${connection.id}:${p.externalId}`,
      connectionId: connection.id,
      externalId: String(p.externalId),
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

    const orders = (ordersUpserts || []).map((o: any) => ({
      id: `${connection.id}:${o.externalId}`,
      connectionId: connection.id,
      externalId: String(o.externalId),
      status: String(o.status || ''),
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
        ? o.items.map((it: any, idx: number) => ({
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
      metadata: {
        ...(connection.metadata || {}),
        lastIngestAt: new Date().toISOString(),
        lastIngestFetchedAt: parsed.data.fetchedAt || null,
        lastIngestAgentVersion: parsed.data.agentVersion || null,
        lastIngestCounts: { products: products.length, orders: orders.length },
      },
    } as any);

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

