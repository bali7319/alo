function normalizePanelUrl(input) {
  let v = String(input || '').trim();
  if (!v) return '';
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  v = v.replace(/\/+$/, '');
  return v;
}

function normalizeBaseUrl(input) {
  let v = String(input || '').trim();
  if (!v) return '';
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  v = v.replace(/\/+$/, '');
  return v;
}

function maskSecret(value) {
  const v = String(value || '').trim();
  if (!v) return '';
  const last = v.slice(-4);
  return `${'*'.repeat(Math.max(8, v.length - 4))}${last}`;
}

async function fetchJson(url, { method = 'GET', token, body, timeoutMs = 20000 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: 'no-store',
    });

    const text = await res.text().catch(() => '');
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!res.ok) {
      const msg = (json && (json.error || json.details)) || text || `HTTP ${res.status}`;
      const err = new Error(`HTTP ${res.status}: ${String(msg).substring(0, 400)}`);
      err.status = res.status;
      err.payload = json;
      throw err;
    }

    return json;
  } finally {
    clearTimeout(timeout);
  }
}

async function wooFetch(creds, path, qs) {
  const baseUrl = normalizeBaseUrl(creds.baseUrl);
  const apiPrefix = String(creds.apiPrefix || '/wp-json/wc/v3').trim();
  const prefix = apiPrefix.startsWith('/') ? apiPrefix : `/${apiPrefix}`;
  const base = `${baseUrl}${prefix}`;
  const url = new URL(`${base}${path.startsWith('/') ? '' : '/'}${path}`);
  if (qs) {
    for (const [k, v] of Object.entries(qs)) {
      if (typeof v === 'undefined') continue;
      url.searchParams.set(k, String(v));
    }
  }

  const auth = Buffer.from(`${creds.consumerKey}:${creds.consumerSecret}`, 'utf8').toString('base64');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(creds.timeoutMs || 20000));
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
      throw new Error(`Woo HTTP ${res.status}: ${text.substring(0, 300)}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function wooListAllProducts(creds, log) {
  const all = [];
  let page = 1;
  const per_page = 100;
  while (page <= 50) {
    log && log('woo products page', page);
    const items = await wooFetch(creds, '/products', {
      per_page,
      page,
      orderby: 'id',
      order: 'desc',
      status: 'publish',
    });
    all.push(...(Array.isArray(items) ? items : []));
    if (!items || items.length < per_page) break;
    page++;
  }
  return all;
}

async function wooListAllOrders(creds, log) {
  const all = [];
  let page = 1;
  const per_page = 100;
  while (page <= 20) {
    log && log('woo orders page', page);
    const items = await wooFetch(creds, '/orders', {
      per_page,
      page,
      orderby: 'date',
      order: 'desc',
    });
    all.push(...(Array.isArray(items) ? items : []));
    if (!items || items.length < per_page) break;
    page++;
  }
  return all;
}

function mapProductsUpserts(items) {
  return (items || []).map((p) => ({
    externalId: String(p.id),
    merchantSku: p.sku || null,
    barcode: null,
    title: p.name || null,
    price: p.price ?? null,
    currency: 'TRY',
    stock: typeof p.stock_quantity === 'number' ? p.stock_quantity : null,
    raw: p,
  }));
}

function mapOrdersUpserts(items) {
  return (items || []).map((o) => {
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
      items: line_items.map((li) => ({
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
}

async function getConfig({ panelUrl, token, provider = 'woocommerce', log }) {
  const base = normalizePanelUrl(panelUrl);
  if (!base) throw new Error('Panel URL gerekli');
  if (!token) throw new Error('Agent token gerekli');

  const url = `${base}/api/admin/marketplaces/agent/config/${encodeURIComponent(String(provider))}`;
  const json = await fetchJson(url, { token, method: 'GET' });
  const creds = json && json.credentials ? json.credentials : {};
  const safe = {
    provider: json.provider,
    connection: json.connection,
    credentials: {
      baseUrl: normalizeBaseUrl(creds.baseUrl || ''),
      consumerKeyMasked: maskSecret(creds.consumerKey || creds.key || ''),
      consumerSecretMasked: maskSecret(creds.consumerSecret || creds.secret || ''),
      apiPrefix: creds.apiPrefix || '/wp-json/wc/v3',
    },
  };

  log && log('config ok', safe.credentials.baseUrl, safe.credentials.consumerKeyMasked);
  return { ok: true, config: json, safe };
}

async function syncNow({ panelUrl, token, provider = 'woocommerce', log }) {
  const cfg = await getConfig({ panelUrl, token, provider, log });
  const creds = cfg.config.credentials || {};

  const wooCreds = {
    baseUrl: creds.baseUrl,
    consumerKey: creds.consumerKey || creds.key,
    consumerSecret: creds.consumerSecret || creds.secret,
    apiPrefix: creds.apiPrefix || '/wp-json/wc/v3',
    timeoutMs: creds.timeoutMs || 20000,
  };

  if (!wooCreds.baseUrl || !wooCreds.consumerKey || !wooCreds.consumerSecret) {
    throw new Error('Woo credentials eksik. Panelde entegrasyon bilgilerini kontrol edin.');
  }

  log && log('woo fetch start', normalizeBaseUrl(wooCreds.baseUrl));
  const [productsRaw, ordersRaw] = await Promise.all([
    wooListAllProducts(wooCreds, log),
    wooListAllOrders(wooCreds, log),
  ]);
  log && log('woo fetch done', `products=${productsRaw.length}`, `orders=${ordersRaw.length}`);

  const productsUpserts = mapProductsUpserts(productsRaw);
  const ordersUpserts = mapOrdersUpserts(ordersRaw);

  const base = normalizePanelUrl(panelUrl);
  const ingestUrl = `${base}/api/admin/marketplaces/agent/ingest/${encodeURIComponent(String(provider))}`;
  const fetchedAt = new Date().toISOString();
  const res = await fetchJson(ingestUrl, {
    method: 'POST',
    token,
    timeoutMs: 60000,
    body: { productsUpserts, ordersUpserts, fetchedAt, agentVersion: '0.1.0' },
  });

  log && log('ingest ok', JSON.stringify(res));
  return {
    ok: true,
    counts: { products: productsUpserts.length, orders: ordersUpserts.length },
    panel: res,
    fetchedAt,
    safe: cfg.safe,
  };
}

module.exports = {
  getConfig,
  syncNow,
};

