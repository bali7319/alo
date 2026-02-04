import type { MarketplaceProvider } from '@prisma/client';
import type { MarketplaceAdapter } from './types';
import { wooListAllOrders, wooListAllProducts, wooTestConnection } from './woocommerce';

function notImplemented(provider: MarketplaceProvider): MarketplaceAdapter {
  return {
    provider,
    async testConnection() {
      return {
        ok: false,
        message: `${provider} entegrasyonu henüz uygulanmadı. Credential kaydı yapıldı; bir sonraki adım API çağrılarını eklemek.`,
      };
    },
  };
}

function woocommerceAdapter(): MarketplaceAdapter {
  return {
    provider: 'woocommerce',
    async testConnection(credentials: any) {
      try {
        await wooTestConnection({
          baseUrl: String(credentials?.baseUrl || ''),
          consumerKey: String(credentials?.consumerKey || ''),
          consumerSecret: String(credentials?.consumerSecret || ''),
          apiPrefix: credentials?.apiPrefix ? String(credentials.apiPrefix) : undefined,
          timeoutMs: credentials?.timeoutMs ? Number(credentials.timeoutMs) : undefined,
        });
        return { ok: true, message: 'Bağlantı başarılı' };
      } catch (e: any) {
        return { ok: false, message: e?.message ?? String(e) };
      }
    },
    async listProducts(credentials: any) {
      const items = await wooListAllProducts({
        baseUrl: String(credentials?.baseUrl || ''),
        consumerKey: String(credentials?.consumerKey || ''),
        consumerSecret: String(credentials?.consumerSecret || ''),
        apiPrefix: credentials?.apiPrefix ? String(credentials.apiPrefix) : undefined,
        timeoutMs: credentials?.timeoutMs ? Number(credentials.timeoutMs) : undefined,
      });
      return items.map((p: any) => ({
        externalId: String(p.id),
        merchantSku: p.sku || null,
        barcode: null,
        title: p.name || null,
        price: p.price ?? null,
        currency: 'TRY',
        stock: typeof p.stock_quantity === 'number' ? p.stock_quantity : null,
        raw: p,
      }));
    },
    async listOrders(credentials: any) {
      const items = await wooListAllOrders({
        baseUrl: String(credentials?.baseUrl || ''),
        consumerKey: String(credentials?.consumerKey || ''),
        consumerSecret: String(credentials?.consumerSecret || ''),
        apiPrefix: credentials?.apiPrefix ? String(credentials.apiPrefix) : undefined,
        timeoutMs: credentials?.timeoutMs ? Number(credentials.timeoutMs) : undefined,
      });

      return items.map((o: any) => {
        const billing = o.billing || {};
        const shipping = o.shipping || {};
        const buyerName = [billing.first_name, billing.last_name].filter(Boolean).join(' ') || null;
        const shipName = [shipping.first_name, shipping.last_name].filter(Boolean).join(' ') || null;
        const line_items = Array.isArray(o.line_items) ? o.line_items : [];
        return {
          externalId: String(o.id),
          status: String(o.status || ''),
          placedAt: o.date_created || o.date_created_gmt || null,
          buyerName,
          buyerEmail: billing.email || null,
          buyerPhone: billing.phone || null,
          shippingName: shipName,
          shippingAddress: shipping.address_1 || shipping.address_2 || null,
          shippingCity: shipping.city || null,
          shippingDistrict: shipping.state || null,
          shippingPostalCode: shipping.postcode || null,
          totalAmount: o.total ?? null,
          currency: o.currency || 'TRY',
          raw: o,
          items: line_items.map((li: any) => ({
            externalId: li.id ? String(li.id) : null,
            merchantSku: li.sku ? String(li.sku) : null,
            barcode: null,
            title: li.name || null,
            quantity: typeof li.quantity === 'number' ? li.quantity : 1,
            unitPrice: li.price ?? null,
            totalPrice: li.total ?? null,
            currency: o.currency || 'TRY',
            raw: li,
          })),
        };
      });
    },
  };
}

export function getMarketplaceAdapter(provider: MarketplaceProvider): MarketplaceAdapter {
  switch (provider) {
    case 'trendyol':
    case 'hepsiburada':
    case 'n11':
    case 'pazarama':
      return notImplemented(provider);
    case 'woocommerce':
      return woocommerceAdapter();
    default: {
      const _exhaustive: never = provider;
      return notImplemented(_exhaustive);
    }
  }
}

