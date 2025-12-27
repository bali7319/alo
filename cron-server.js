// PM2 ile çalışacak cron job servisi
// Bu dosya PM2 ecosystem.config.js'de ayrı bir servis olarak çalışacak

const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Her gün gece 00:02'de çalışacak cron job
// Cron format: dakika saat gün ay haftanın-günü
// "2 0 * * *" = Her gün 00:02'de
const CRON_SCHEDULE = '2 0 * * *';

async function expireListings() {
  try {
    console.log(`[${new Date().toISOString()}] Cron job başlatıldı: Süresi dolan ilanları kontrol ediliyor...`);
    
    const now = new Date();
    
    // Süresi dolan ilanları bul (expiresAt < now ve isActive = true)
    const expiredListings = await prisma.listing.findMany({
      where: {
        isActive: true,
        expiresAt: {
          lt: now
        }
      },
      select: {
        id: true,
        title: true,
        expiresAt: true
      }
    });

    console.log(`[${new Date().toISOString()}] ${expiredListings.length} adet süresi dolmuş ilan bulundu`);

    if (expiredListings.length > 0) {
      // İlanları pasif yap
      const result = await prisma.listing.updateMany({
        where: {
          id: {
            in: expiredListings.map(l => l.id)
          }
        },
        data: {
          isActive: false
        }
      });

      console.log(`[${new Date().toISOString()}] ${result.count} ilan yayından kaldırıldı`);
      
      // Detaylı log
      expiredListings.forEach(listing => {
        console.log(`  - İlan ID: ${listing.id}, Başlık: ${listing.title}, Süre: ${listing.expiresAt.toISOString()}`);
      });
    } else {
      console.log(`[${new Date().toISOString()}] Süresi dolmuş ilan bulunamadı`);
    }

    console.log(`[${new Date().toISOString()}] Cron job tamamlandı`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Cron job hatası:`, error);
  }
}

// Cron job'u başlat
console.log(`[${new Date().toISOString()}] Cron job zamanlayıcısı başlatılıyor. Schedule: ${CRON_SCHEDULE}`);

// Zamanlanmış çalıştırma
cron.schedule(CRON_SCHEDULE, expireListings, {
  scheduled: true,
  timezone: "Europe/Istanbul" // Türkiye saati
});

console.log(`[${new Date().toISOString()}] Cron job aktif. Her gün 00:02'de çalışacak.`);

// Servisi çalışır durumda tut
setInterval(() => {
  // Her 5 dakikada bir heartbeat (servis çalışıyor mu kontrol)
  const now = new Date();
  if (now.getMinutes() % 5 === 0 && now.getSeconds() < 10) {
    console.log(`[${now.toISOString()}] Cron servisi çalışıyor...`);
  }
}, 60000); // Her dakika kontrol et

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Cron servisi kapatılıyor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Cron servisi kapatılıyor...');
  await prisma.$disconnect();
  process.exit(0);
});
