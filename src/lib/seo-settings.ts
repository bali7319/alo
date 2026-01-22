import { prisma } from '@/lib/prisma';

export type SeoSettings = {
  internalLinking: boolean;
  linkTracking: boolean;
};

const KEY = 'seo_settings';

const DEFAULTS: SeoSettings = {
  internalLinking: true,
  linkTracking: false,
};

let cache: { at: number; value: SeoSettings } | null = null;
const CACHE_TTL_MS = 60_000;

function coerceBool(v: unknown, fallback: boolean) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return v === '1' || v.toLowerCase() === 'true';
  return fallback;
}

export async function getSeoSettings(): Promise<SeoSettings> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL_MS) return cache.value;

  try {
    const rec = await prisma.settings.findUnique({ where: { key: KEY } });
    if (!rec) {
      // Create defaults if missing
      await prisma.settings.create({ data: { key: KEY, value: JSON.stringify(DEFAULTS) } }).catch(() => null);
      cache = { at: now, value: DEFAULTS };
      return DEFAULTS;
    }

    const parsed = JSON.parse(rec.value ?? '{}') as Partial<SeoSettings>;
    const value: SeoSettings = {
      internalLinking: coerceBool(parsed.internalLinking, DEFAULTS.internalLinking),
      linkTracking: coerceBool(parsed.linkTracking, DEFAULTS.linkTracking),
    };
    cache = { at: now, value };
    return value;
  } catch {
    cache = { at: now, value: DEFAULTS };
    return DEFAULTS;
  }
}

export async function setSeoSettings(patch: Partial<SeoSettings>): Promise<SeoSettings> {
  const current = await getSeoSettings();
  const next: SeoSettings = {
    internalLinking: typeof patch.internalLinking === 'boolean' ? patch.internalLinking : current.internalLinking,
    linkTracking: typeof patch.linkTracking === 'boolean' ? patch.linkTracking : current.linkTracking,
  };

  await prisma.settings.upsert({
    where: { key: KEY },
    update: { value: JSON.stringify(next) },
    create: { key: KEY, value: JSON.stringify(next) },
  });

  cache = { at: Date.now(), value: next };
  return next;
}

