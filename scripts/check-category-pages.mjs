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
    notifyTo: null,
    notifyOnOk: false,
    notifySubjectPrefix: '[Alo17]',
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
    if ((a === '--notify' || a === '--notifyTo') && next) {
      out.notifyTo = String(next).trim();
      i++;
      continue;
    }
    if (a === '--notifyOnOk') {
      out.notifyOnOk = true;
      continue;
    }
    if (a === '--notifySubjectPrefix' && next) {
      out.notifySubjectPrefix = String(next);
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

function loadDotEnvIfPresent() {
  // Minimal .env loader for cron/CLI use (does not print secrets).
  // Only sets keys that are not already present in process.env.
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  try {
    const raw = fs.readFileSync(envPath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const s = line.trim();
      if (!s || s.startsWith('#')) continue;
      const eq = s.indexOf('=');
      if (eq <= 0) continue;
      const key = s.slice(0, eq).trim();
      let val = s.slice(eq + 1).trim();
      if (!key) continue;
      if (Object.prototype.hasOwnProperty.call(process.env, key)) continue;
      // Strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  } catch {
    // ignore
  }
}

async function sendNotificationEmail({
  to,
  subject,
  text,
  html,
}) {
  // Load env for CLI/cron
  loadDotEnvIfPresent();

  // Prefer HTTPS mail API (Resend) if configured (works over 443).
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.EMAIL_FROM || process.env.RESEND_FROM || null;
  if (resendApiKey) {
    if (!resendFrom) {
      console.log('[notify] RESEND_API_KEY var ama EMAIL_FROM/RESEND_FROM yok; mail atlanıyor.');
      return { sent: false, reason: 'resend_from_missing' };
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: resendFrom,
        to,
        subject,
        text,
        html,
      }),
    });

    const raw = await res.text();
    let json = null;
    try {
      json = raw ? JSON.parse(raw) : null;
    } catch {
      // ignore
    }

    if (!res.ok) {
      console.error('[notify] Resend email failed:', { status: res.status, body: json || raw });
      return { sent: false, reason: 'resend_failed' };
    }

    console.log('[notify] Resend email sent:', {
      to,
      id: json?.id,
    });
    return { sent: true, provider: 'resend' };
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log('[notify] No mail provider configured; skipping email.');
    return { sent: false, reason: 'not_configured' };
  }

  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
    tls: {
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false',
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    pool: false,
    maxConnections: 1,
  });

  await transporter.verify();

  const info = await transporter.sendMail({
    from: smtpUser, // relay-safe
    to,
    subject,
    text,
    html,
  });

  console.log('[notify] Email sent:', {
    to,
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  });

  return { sent: true, provider: 'smtp' };
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

  // Optional email notification
  if (opts.notifyTo && (opts.notifyOnOk || soft404Count || failCount)) {
    const stamp = new Date().toISOString();
    const subj = `${opts.notifySubjectPrefix} Category page check ${soft404Count || failCount ? 'FAILED' : 'OK'} (soft404=${soft404Count} fail=${failCount})`;

    const topBad = bad.slice(0, 50);
    const lines = [
      `Alo17 category page health check`,
      ``,
      `Time: ${stamp}`,
      `Base: ${opts.base}`,
      `Checked: ${results.length}`,
      `OK: ${okCount}`,
      `Soft-404: ${soft404Count}`,
      `Fail: ${failCount}`,
      ``,
      ...(topBad.length
        ? [
            `Top problematic URLs (up to 50):`,
            ...topBad.map((r) => `- ${r.url} (${r.ok ? 'soft-404' : `fail:${r.status || 0}`}${r.softNotFound ? `; ${r.softNotFound.join(', ')}` : ''}${r.error ? `; ${r.error}` : ''})`),
          ]
        : [`No problems detected.`]),
      ``,
      `This email was sent by scripts/check-category-pages.mjs`,
    ];

    const text = lines.join('\n');
    const html = `<pre style="font: 13px/1.4 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; white-space: pre-wrap;">${text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')}</pre>`;

    try {
      await sendNotificationEmail({
        to: opts.notifyTo,
        subject: subj,
        text,
        html,
      });
    } catch (e) {
      console.error('[notify] Email send failed:', e instanceof Error ? e.message : String(e));
    }
  }

  // exit code
  if (soft404Count || failCount) process.exitCode = 1;
}

main().catch((e) => {
  console.error('[check-category-pages] fatal:', e);
  process.exitCode = 2;
});

