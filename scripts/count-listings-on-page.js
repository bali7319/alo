// /ilanlar sayfasında görünen ilan sayısını kontrol et
// API'den gelen veriyi kontrol eder
// Kullanım: node scripts/count-listings-on-page.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function countListingsOnPage() {
  try {
    console.log('🔍 /ilanlar sayfasında görünen ilan sayısı kontrol ediliyor...\n');

    // Admin kullanıcısını bul
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@alo17.tr' },
      select: { id: true, email: true },
    });

    // /api/listings endpoint'inin döndüreceği ilanları simüle et
    const where: any = {
      isActive: true,
      approvalStatus: 'approved',
      expiresAt: {
        gt: new Date()
      }
    };

    // Admin kullanıcısının ilanlarını hariç tut (API route'unda yapılan filtreleme)
    if (adminUser) {
      where.userId = { not: adminUser.id };
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        select: {
          id: true,
          title: true,
          category: true,
          isActive: true,
          approvalStatus: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100, // /ilanlar sayfası limit=100 çekiyor
      }),
      prisma.listing.count({ where }),
    ]);

    console.log(`📊 /ilanlar sayfasında görünecek ilan sayısı:`);
    console.log(`   - İlk 100 ilan: ${listings.length}`);
    console.log(`   - Toplam ilan: ${total}`);
    console.log('');

    if (listings.length > 0) {
      console.log('📋 İlk 20 ilan:');
      listings.slice(0, 20).forEach((l, index) => {
        console.log(`   ${index + 1}. ${l.title} (${l.category})`);
      });
      if (listings.length > 20) {
        console.log(`   ... ve ${listings.length - 20} ilan daha`);
      }
    } else {
      console.log('✅ /ilanlar sayfasında görünecek ilan yok (admin ilanları filtrelendi)');
    }

    // Admin'in ilanlarını da göster
    if (adminUser) {
      const adminListings = await prisma.listing.findMany({
        where: { userId: adminUser.id },
        select: { id: true, title: true, category: true },
      });
      console.log(`\n👤 Admin kullanıcısının ilanları (filtrelenmiş): ${adminListings.length}`);
      adminListings.forEach(l => {
        console.log(`   - ${l.title} (${l.category})`);
      });
    }

  } catch (error) {
    console.error('\n❌ Hata:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

countListingsOnPage();

