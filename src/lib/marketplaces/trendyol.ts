/**
 * Trendyol Seller/Integrator API.
 * Docs: https://developers.trendyol.com
 * Auth: Basic Auth (API Key : API Secret). Path uses sellerId (supplierId).
 */
const TRENDYOL_SUPPLIER_BASE = 'https://api.trendyol.com/sapigw/suppliers';
const TRENDYOL_APIGW_BASE = 'https://apigw.trendyol.com/integration';

type TrendyolCredentials = {
  sellerId: string;
  apiKey: string;
  apiSecret: string;
  token?: string; // optional bearer fallback
};

function getAuthHeader(creds: TrendyolCredentials): string {
  const user = (creds.apiKey || '').trim();
  const pass = (creds.apiSecret || '').trim();
  if (!user || !pass) throw new Error('Trendyol API Key ve API Secret gerekli');
  return 'Basic ' + Buffer.from(`${user}:${pass}`, 'utf8').toString('base64');
}

async function trendyolFetch<T>(
  creds: TrendyolCredentials,
  base: string,
  path: string,
  qs?: Record<string, string | number | undefined>
): Promise<T> {
  const sellerId = (creds.sellerId || '').trim();
  if (!sellerId) throw new Error('Trendyol Satıcı ID gerekli');

  const pathWithSeller = path.replace('{sellerId}', sellerId);
  const url = new URL(`${base}${pathWithSeller.startsWith('/') ? pathWithSeller : '/' + pathWithSeller}`);
  if (qs) {
    for (const [k, v] of Object.entries(qs)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: getAuthHeader(creds),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(url.toString(), {
      headers,
      signal: controller.signal,
      cache: 'no-store',
    });
    const text = await res.text().catch(() => '');
    if (!res.ok) {
      throw new Error(`Trendyol API ${res.status}: ${text.substring(0, 300)}`);
    }
    return text ? (JSON.parse(text) as T) : ({} as T);
  } finally {
    clearTimeout(timeout);
  }
}

export async function trendyolTestConnection(creds: TrendyolCredentials): Promise<void> {
  await trendyolFetch<{ content?: unknown[] }>(creds, TRENDYOL_SUPPLIER_BASE, `/${(creds.sellerId || '').trim()}/products`, { page: '0', size: '1' });
}

interface TrendyolProductContent {
  id?: number;
  barcode?: string;
  title?: string;
  salePrice?: number;
  listPrice?: number;
  quantity?: number;
  stockCode?: string;
  [key: string]: unknown;
}

interface TrendyolProductsResponse {
  content?: TrendyolProductContent[];
  totalElements?: number;
  totalPages?: number;
}

export async function trendyolListAllProducts(creds: TrendyolCredentials): Promise<TrendyolProductContent[]> {
  const sellerId = (creds.sellerId || '').trim();
  const all: TrendyolProductContent[] = [];
  let page = 0;
  const size = 200;
  while (page < 100) {
    const data = await trendyolFetch<TrendyolProductsResponse>(creds, TRENDYOL_SUPPLIER_BASE, `/${sellerId}/products`, { page: String(page), size: String(size) });
    const content = data?.content ?? [];
    all.push(...content);
    if (content.length < size) break;
    page++;
  }
  return all;
}

interface TrendyolOrderContent {
  id?: number;
  orderNumber?: string;
  orderDate?: string;
  status?: string;
  customerName?: string;
  customerEmail?: string;
  shipmentAddress?: { fullName?: string; address1?: string; city?: string; district?: string };
  grossAmount?: number;
  [key: string]: unknown;
}

interface TrendyolOrdersResponse {
  content?: TrendyolOrderContent[];
  totalElements?: number;
}

export async function trendyolListAllOrders(creds: TrendyolCredentials): Promise<TrendyolOrderContent[]> {
  const all: TrendyolOrderContent[] = [];
  let page = 0;
  const size = 200;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 365);
  const startTs = Math.floor(startDate.getTime() / 1000);
  const endTs = Math.floor(endDate.getTime() / 1000);

  while (page < 50) {
    const data = await trendyolFetch<TrendyolOrdersResponse>(
      creds,
      TRENDYOL_APIGW_BASE,
      '/order/sellers/{sellerId}/orders',
      { startDate: startTs, endDate: endTs, page: String(page), size: String(size) }
    );
    const content = data?.content ?? [];
    all.push(...content);
    if (content.length < size) break;
    page++;
  }
  return all;
}
