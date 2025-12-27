// Veritabanındaki TÜM ilanları kontrol et (aktif/pasif, onaylı/onaysız)
// Kullanım: node scripts/check-all-listings-in-db.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllListings() {
  try {
    console.log('🔍 Veritabanındaki TÜM ilanlar kontrol ediliyor...\n');

    // Tüm ilanları say
    const totalCount = await prisma.listing.count();
    console.log(`📊 Toplam ilan sayısı: ${totalCount}\n`);

    // Durumlara göre grupla
    const [activeApproved, activePending, activeRejected, inactive] = await Promise.all([
      prisma.listing.count({
        where: { isActive: true, approvalStatus: 'approved' },
      }),
      prisma.listing.count({
        where: { isActive: true, approvalStatus: 'pending' },
      }),
      prisma.listing.count({
        where: { isActive: true, approvalStatus: 'rejected' },
      }),
      prisma.listing.count({
        where: { isActive: false },
      }),
    ]);

    console.log('📊 Durumlara göre dağılım:');
    console.log(`   - Aktif ve Onaylı: ${activeApproved}`);
    console.log(`   - Aktif ve Beklemede: ${activePending}`);
    console.log(`   - Aktif ve Reddedilmiş: ${activeRejected}`);
    console.log(`   - Pasif: ${inactive}`);
    console.log('');

    // Admin kullanıcısını bul
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@alo17.tr' },
      select: { id: true, email: true },
    });

    if (adminUser) {
      const adminListingsCount = await prisma.listing.count({
        where: { userId: adminUser.id },
      });
      console.log(`👤 Admin kullanıcısına ait toplam ${adminListingsCount} ilan var\n`);
    }

    // Son 20 ilanı listele
    console.log('📋 Son 20 ilan:');
    const recentListings = await prisma.listing.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        isActive: true,
        approvalStatus: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    recentListings.forEach((l, index) => {
      console.log(`   ${index + 1}. ${l.title}`);
      console.log(`      - Kategori: ${l.category}`);
      console.log(`      - Durum: ${l.isActive ? 'Aktif' : 'Pasif'} / ${l.approvalStatus}`);
      console.log(`      - Kullanıcı: ${l.user?.email || 'Bilinmeyen'} (${l.user?.name || 'İsimsiz'})`);
      console.log(`      - Tarih: ${l.createdAt.toISOString().split('T')[0]}`);
      console.log('');
    });

    // "Örnek" içeren ilanları kontrol et
    const ornekCount = await prisma.listing.count({
      where: {
        OR: [
          { title: { contains: 'Örnek', mode: 'insensitive' } },
          { title: { contains: 'örnek', mode: 'insensitive' } },
          { title: { contains: 'Demo', mode: 'insensitive' } },
          { title: { contains: 'demo', mode: 'insensitive' } },
        ],
      },
    });

    console.log(`\n📊 "Örnek" veya "Demo" içeren ilan sayısı: ${ornekCount}`);

    if (ornekCount > 0) {
      console.log('\n🔍 "Örnek" içeren ilanlar:');
      const ornekListings = await prisma.listing.findMany({
        where: {
          OR: [
            { title: { contains: 'Örnek', mode: 'insensitive' } },
            { title: { contains: 'örnek', mode: 'insensitive' } },
            { title: { contains: 'Demo', mode: 'insensitive' } },
            { title: { contains: 'demo', mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          isActive: true,
          approvalStatus: true,
          user: {
            select: {
              email: true,
            },
          },
        },
        take: 50,
      });

      ornekListings.forEach(l => {
        console.log(`   - ${l.title} (${l.isActive ? 'Aktif' : 'Pasif'} / ${l.approvalStatus}) - ${l.user?.email || 'Bilinmeyen'}`);
      });
    }

  } catch (error) {
    console.error('\n❌ Hata:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllListings();

