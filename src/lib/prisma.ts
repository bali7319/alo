import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient; prismaUrl?: string };

function addDefaultPoolParamsToPgUrl(rawUrl: string): string {
  // Adds safe defaults only if caller didn't specify them.
  // Prisma reads these from DATABASE_URL query params.
  // Example: ...?connection_limit=10&pool_timeout=20
  try {
    // URL can parse postgres URLs in Node.
    const u = new URL(rawUrl);
    const sp = u.searchParams;

    if (!sp.has('connection_limit') && process.env.PRISMA_CONNECTION_LIMIT) {
      sp.set('connection_limit', String(process.env.PRISMA_CONNECTION_LIMIT));
    }
    if (!sp.has('pool_timeout') && process.env.PRISMA_POOL_TIMEOUT) {
      sp.set('pool_timeout', String(process.env.PRISMA_POOL_TIMEOUT));
    }

    // Reasonable production defaults if not set anywhere.
    // Keep these conservative to avoid exhausting DB connections.
    if (!sp.has('connection_limit')) sp.set('connection_limit', '10');
    if (!sp.has('pool_timeout')) sp.set('pool_timeout', '20');

    u.search = sp.toString();
    return u.toString();
  } catch {
    return rawUrl;
  }
}

function getSafeDatabaseUrl() {
  const raw = process.env.DATABASE_URL || '';
  const isPg = raw.startsWith('postgresql://') || raw.startsWith('postgres://');

  // PrismaClient constructor validates the datasource URL format on instantiation.
  // In local dev where DATABASE_URL may be missing/invalid, we still want the app to boot
  // so pages can render with graceful fallbacks (try/catch around queries).
  if (!isPg) {
    const strict = process.env.STRICT_DATABASE_URL === 'true';
    if (process.env.NODE_ENV === 'production') {
      // NOTE: `next build` sırasında NODE_ENV=production olacağı için burada default'ta throw etmiyoruz.
      // Prod sunucuda "fail-fast" isteniyorsa STRICT_DATABASE_URL=true set edilebilir.
      if (strict) {
        throw new Error('[prisma] DATABASE_URL is missing or not a postgres URL (STRICT_DATABASE_URL=true).');
      }
      console.warn('[prisma] DATABASE_URL is missing or not a postgres URL in production. Using dummy URL.');
    } else {
      console.warn(
        '[prisma] DATABASE_URL is missing or not a postgres URL. Using a dummy postgres URL for local UI/dev.'
      );
    }
    return 'postgresql://invalid:invalid@127.0.0.1:5432/invalid';
  }

  // Add safe pooling defaults (unless already provided)
  return addDefaultPoolParamsToPgUrl(raw);
}

const prismaUrl = getSafeDatabaseUrl();

export const prisma =
  (globalForPrisma.prisma && globalForPrisma.prismaUrl === prismaUrl ? globalForPrisma.prisma : undefined) ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: prismaUrl,
      },
    },
    // Connection pool ayarları - 502 hatalarını önlemek için
    // PostgreSQL için optimal connection pool ayarları
    // connection_limit: DATABASE_URL'deki connection_limit parametresi ile kontrol edilir
    // Örnek: postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
  });

// Production'da da global'de tut (connection pool için önemli)
globalForPrisma.prisma = prisma;
globalForPrisma.prismaUrl = prismaUrl;

// Graceful shutdown için
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}