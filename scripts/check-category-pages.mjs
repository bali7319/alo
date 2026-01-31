/**
 * Category page health checker (production-safe)
 *
 * - Reads URLs from `${base}/sitemap.xml`
 * - Filters `/kategori/` pages
 * - Fetches each page (GET)
 * - Flags pages that render "not found" style content while returning 200
 *
 * Usage:
 *   node scripts/check-category-pages.mjs
 *   node scripts/check-category-pages.mjs --base https://alo17.tr --concurrency 6 --max 2000
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv) {
  const out = {
    base: 'https://alo17.tr',
    concurrency: 6,
    max: Infinity,
    timeoutMs: 25000,
    retries: 1,
    includeRegex: null,
    outputJson: true,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = argv[i + 1];
    if (a === '--base' && next) {
      out.base = String(next).replace(/\/+$/, '');
      i++;
      continue;
    }
    if (a === '--concurrency' && next) {
      out.concurrency = Math.max(1, Number(next) || 1);
      i++;
      continue;
    }
    if (a === '--max' && next) {
      const n = Number(next);
      out.max = Number.isFinite(n) ? Math.max(1, n) : Infinity;
      i++;
      continue;
    }
    if (a === '--timeoutMs' && next) {
      out.timeoutMs = Math.max(1000, Number(next) || 25000);
      i++;
      continue;
    }
    if (a === '--retries' && next) {
      out.retries = Math.max(0, Number(next) || 0);
      i++;
      continue;
    }
    if (a === '--include' && next) {
      out.includeRegex = new RegExp(String(next), 'i');
      i++;
      continue;
    }
    if (a === '--no-json') {
      out.outputJson = false;
      continue;
    }
  }
  return out;
}

function withTimeout(promise, timeoutMs, label) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  return Promise.race([
    promise(ctrl.signal),
    new Promise((_, reject) => {
      ctrl.signal.addEventListener('abort', () => reject(new Error(`Timeout: ${label}`)), { once: true });
    }),
  ]).finally(() => clearTimeout(t));
}

async function fetchText(url, timeoutMs) {
  return withTimeout(
    async (signal) => {
      const res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent': 'alo17-category-check/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal,
      });
      const text = await res.text();
      return { status: res.status, ok: res.ok, text };
    },
    timeoutMs,
    url
  );
}

async function fetchTextWithRetries(url, timeoutMs, retries) {
  let lastErr = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const attemptTimeout = Math.round(timeoutMs * (attempt === 0 ? 1 : 2));
    const started = Date.now();
    try {
      const res = await fetchText(url, attemptTimeout);
      return { ...res, ms: Date.now() - started, attempt };
    } catch (e) {
      lastErr = e;
      const msg = e instanceof Error ? e.message : String(e);
      const isTimeout = msg.startsWith('Timeout:');
      if (!isTimeout) break;
      // small backoff
      await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
    }
  }
  throw lastErr ?? new Error('Unknown fetch error');
}

function extractSitemapUrls(xml) {
  // Very small XML parse for <loc> tags (no dependency).
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/gim;
  let m;
  while ((m = re.exec(xml))) {
    const u = String(m[1] || '').trim();
    if (u) urls.push(u);
  }
  return urls;
}

function isCategoryUrl(u, base) {
  if (!u.startsWith(base)) return false;
  const p = u.slice(base.length);
  return p === '/kategoriler' || p.startsWith('/kategori/');
}

function detectSoftNotFound(html) {
  const needles = [
    'Kategori bulunamadı',
    'Alt kategori bulunamadı',
    'Alt-alt kategori bulunamadı',
  ];
  const found = needles.filter((n) => html.includes(n));
  return found.length ? found : null;
}

async function runPool(items, concurrency, worker) {
  const results = new Array(items.length);
  let idx = 0;

  async function runner() {
    while (true) {
      const myIdx = idx++;
      if (myIdx >= items.length) break;
      results[myIdx] = await worker(items[myIdx], myIdx);
    }
  }

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, () => runner());
  await Promise.all(runners);
  return results;
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  const sitemapUrl = `${opts.base}/sitemap.xml`;
  console.log(`[check-category-pages] sitemap: ${sitemapUrl}`);

  const sitemap = await fetchText(sitemapUrl, opts.timeoutMs);
  if (!sitemap.ok) {
    console.error(`[check-category-pages] Failed to fetch sitemap: HTTP ${sitemap.status}`);
    process.exitCode = 2;
    return;
  }

  const allUrls = extractSitemapUrls(sitemap.text);
  const categoryUrls = allUrls
    .filter((u) => isCategoryUrl(u, opts.base))
    .filter((u) => (opts.includeRegex ? opts.includeRegex.test(u) : true));

  const toCheck = categoryUrls.slice(0, Number.isFinite(opts.max) ? opts.max : categoryUrls.length);

  console.log(`[check-category-pages] urls in sitemap: ${allUrls.length}`);
  console.log(`[check-category-pages] category urls: ${categoryUrls.length}`);
  console.log(`[check-category-pages] checking: ${toCheck.length} (concurrency=${opts.concurrency})`);

  let okCount = 0;
  let failCount = 0;
  let soft404Count = 0;
  const startedAt = Date.now();

  const results = await runPool(toCheck, opts.concurrency, async (url, i) => {
    if (i % 50 === 0) {
      const elapsed = Math.round((Date.now() - startedAt) / 1000);
      console.log(`[progress] ${i}/${toCheck.length} (ok=${okCount} soft404=${soft404Count} fail=${failCount}) elapsed=${elapsed}s`);
    }

    try {
      const { status, ok, text, ms, attempt } = await fetchTextWithRetries(url, opts.timeoutMs, opts.retries);
      const softNotFound = detectSoftNotFound(text);
      if (!ok) failCount++;
      else if (softNotFound) soft404Count++;
      else okCount++;

      return {
        url,
        status,
        ok,
        softNotFound,
        ms,
        attempt,
      };
    } catch (e) {
      failCount++;
      return {
        url,
        status: 0,
        ok: false,
        softNotFound: null,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  });

  const bad = results.filter((r) => !r.ok || r.softNotFound);
  const soft404 = results.filter((r) => r.ok && r.softNotFound);

  console.log('');
  console.log(`[done] ok=${okCount} soft404=${soft404Count} fail=${failCount} total=${results.length}`);

  if (soft404.length) {
    console.log('');
    console.log('Soft-404 (200 but "not found" content):');
    for (const r of soft404.slice(0, 200)) {
      console.log(`- ${r.url} (${r.softNotFound?.join(', ')})`);
    }
    if (soft404.length > 200) console.log(`... +${soft404.length - 200} more`);
  }

  // Slow pages
  const slow = results
    .filter((r) => r.ok && typeof r.ms === 'number' && r.ms > 15000)
    .sort((a, b) => (b.ms ?? 0) - (a.ms ?? 0));
  if (slow.length) {
    console.log('');
    console.log('Slow pages (ok but > 15s):');
    for (const r of slow.slice(0, 50)) {
      console.log(`- ${r.url} (${Math.round(r.ms)}ms, attempt=${r.attempt ?? 0})`);
    }
    if (slow.length > 50) console.log(`... +${slow.length - 50} more`);
  }

  if (failCount) {
    console.log('');
    console.log('Hard failures (non-2xx or request errors):');
    for (const r of bad.filter((x) => !x.ok).slice(0, 200)) {
      console.log(`- ${r.url} (status=${r.status}${r.error ? `, error=${r.error}` : ''})`);
    }
    if (bad.filter((x) => !x.ok).length > 200) console.log('... more');
  }

  if (opts.outputJson) {
    const reportDir = path.join(__dirname, 'reports');
    fs.mkdirSync(reportDir, { recursive: true });
    const reportPath = path.join(reportDir, `category-pages-${nowStamp()}.json`);
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          base: opts.base,
          checked: results.length,
          okCount,
          soft404Count,
          failCount,
          results,
        },
        null,
        2
      ),
      'utf8'
    );
    console.log('');
    console.log(`[report] ${reportPath}`);
  }

  // exit code
  if (soft404Count || failCount) process.exitCode = 1;
}

main().catch((e) => {
  console.error('[check-category-pages] fatal:', e);
  process.exitCode = 2;
});

