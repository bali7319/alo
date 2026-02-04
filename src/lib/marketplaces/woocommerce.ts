type WooCredentials = {
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
  apiPrefix?: string; // default: /wp-json/wc/v3
  timeoutMs?: number;
};

function normalizeBaseUrl(input: string) {
  let v = (input || '').trim();
  if (!v) return '';
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  v = v.replace(/\/+$/, '');
  return v;
}

function getApiBase(creds: WooCredentials) {
  const baseUrl = normalizeBaseUrl(creds.baseUrl);
  const apiPrefix = (creds.apiPrefix || '/wp-json/wc/v3').trim();
  const prefix = apiPrefix.startsWith('/') ? apiPrefix : `/${apiPrefix}`;
  return `${baseUrl}${prefix}`;
}

async function wooFetch<T>(creds: WooCredentials, path: string, qs?: Record<string, string | number | boolean | undefined>) {
  const base = getApiBase(creds);
  const url = new URL(`${base}${path.startsWith('/') ? '' : '/'}${path}`);
  if (qs) {
    for (const [k, v] of Object.entries(qs)) {
      if (typeof v === 'undefined') continue;
      url.searchParams.set(k, String(v));
    }
  }

  const auth = Buffer.from(`${creds.consumerKey}:${creds.consumerSecret}`, 'utf8').toString('base64');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), creds.timeoutMs || 20000);
  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`WooCommerce HTTP ${res.status}: ${text.substring(0, 200)}`);
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function wooTestConnection(creds: WooCredentials) {
  // Lightweight call
  await wooFetch<any>(creds, '/products', { per_page: 1 });
}

export async function wooListAllProducts(creds: WooCredentials) {
  const all: any[] = [];
  let page = 1;
  const per_page = 100;
  while (page <= 50) {
    const items = await wooFetch<any[]>(creds, '/products', {
      per_page,
      page,
      orderby: 'id',
      order: 'desc',
      status: 'publish',
    });
    all.push(...items);
    if (!items || items.length < per_page) break;
    page++;
  }
  return all;
}

export async function wooListAllOrders(creds: WooCredentials) {
  const all: any[] = [];
  let page = 1;
  const per_page = 100;
  while (page <= 20) {
    const items = await wooFetch<any[]>(creds, '/orders', {
      per_page,
      page,
      orderby: 'date',
      order: 'desc',
    });
    all.push(...items);
    if (!items || items.length < per_page) break;
    page++;
  }
  return all;
}

