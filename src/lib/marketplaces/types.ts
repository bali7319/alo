import type { MarketplaceProvider } from '@prisma/client';

export type MarketplaceProductUpsert = {
  externalId: string;
  merchantSku?: string | null;
  barcode?: string | null;
  title?: string | null;
  price?: string | number | null;
  currency?: string | null;
  stock?: number | null;
  raw?: unknown;
};

export type MarketplaceOrderUpsert = {
  externalId: string;
  status: string;
  placedAt?: Date | string | null;
  buyerName?: string | null;
  buyerEmail?: string | null;
  buyerPhone?: string | null;
  shippingName?: string | null;
  shippingAddress?: string | null;
  shippingCity?: string | null;
  shippingDistrict?: string | null;
  shippingPostalCode?: string | null;
  totalAmount?: string | number | null;
  currency?: string | null;
  raw?: unknown;
  items?: Array<{
    externalId?: string | null;
    merchantSku?: string | null;
    barcode?: string | null;
    title?: string | null;
    quantity?: number | null;
    unitPrice?: string | number | null;
    totalPrice?: string | number | null;
    currency?: string | null;
    raw?: unknown;
  }>;
};

export type ShippingLabelResult = {
  format: 'pdf' | 'zpl' | 'html';
  contentType?: string;
  fileName?: string;
  dataBase64?: string;
};

export type MarketplaceAdapter = {
  provider: MarketplaceProvider;
  testConnection(credentials: any): Promise<{ ok: boolean; message?: string }>;
  listProducts?(credentials: any): Promise<MarketplaceProductUpsert[]>;
  listOrders?(credentials: any): Promise<MarketplaceOrderUpsert[]>;
};

