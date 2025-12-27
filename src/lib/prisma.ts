import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Connection pool ayarları - 502 hatalarını önlemek için
    // PostgreSQL için optimal connection pool ayarları
    // connection_limit: DATABASE_URL'deki connection_limit parametresi ile kontrol edilir
    // Örnek: postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
  });

// Production'da da global'de tut (connection pool için önemli)
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown için
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}