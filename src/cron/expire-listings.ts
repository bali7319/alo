import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

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
export function startExpireListingsCron() {
  console.log(`[${new Date().toISOString()}] Cron job zamanlayıcısı başlatıldı. Schedule: ${CRON_SCHEDULE}`);
  
  // İlk çalıştırmayı hemen yap (test için)
  // expireListings();
  
  // Zamanlanmış çalıştırma
  cron.schedule(CRON_SCHEDULE, expireListings, {
    timezone: "Europe/Istanbul" // Türkiye saati
  });

  console.log(`[${new Date().toISOString()}] Cron job aktif. Her gün 00:02'de çalışacak.`);
}

// Eğer bu dosya doğrudan çalıştırılırsa (test için)
if (require.main === module) {
  console.log('Cron job test modunda çalıştırılıyor...');
  expireListings()
    .then(() => {
      console.log('Test tamamlandı');
      prisma.$disconnect();
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test hatası:', error);
      prisma.$disconnect();
      process.exit(1);
    });
}

