// Tüm demo/örnek/test ilanlarını geniş arama ile kontrol et
// Kullanım: node scripts/check-all-demo-listings.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllDemoListings() {
  try {
    console.log('🔍 Tüm demo/örnek/test ilanları geniş arama ile kontrol ediliyor...\n');

    // Admin kullanıcısını bul
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@alo17.tr' },
      select: { id: true, email: true },
    });

    if (adminUser) {
      console.log(`✅ Admin kullanıcısı: ${adminUser.email} (ID: ${adminUser.id})\n`);
    }

    // Çok geniş arama - her türlü demo/örnek/test içeren ilanları bul
    const demoListings = await prisma.listing.findMany({
      where: {
        OR: [
          { title: { contains: 'Örnek', mode: 'insensitive' } },
          { title: { contains: 'örnek', mode: 'insensitive' } },
          { title: { contains: 'Demo', mode: 'insensitive' } },
          { title: { contains: 'demo', mode: 'insensitive' } },
          { title: { contains: 'Test', mode: 'insensitive' } },
          { title: { contains: 'test', mode: 'insensitive' } },
          { title: { contains: 'ÖRNEK', mode: 'insensitive' } },
          { title: { contains: 'DEMO', mode: 'insensitive' } },
          { title: { contains: 'TEST', mode: 'insensitive' } },
          { description: { contains: 'Örnek', mode: 'insensitive' } },
          { description: { contains: 'örnek', mode: 'insensitive' } },
          { description: { contains: 'Demo', mode: 'insensitive' } },
          { description: { contains: 'demo', mode: 'insensitive' } },
          { brand: { contains: 'Örnek', mode: 'insensitive' } },
          { brand: { contains: 'Demo', mode: 'insensitive' } },
          { model: { contains: 'Örnek', mode: 'insensitive' } },
          { model: { contains: 'Demo', mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        category: true,
        subCategory: true,
        isActive: true,
        approvalStatus: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200, // İlk 200 ilan
    });

    console.log(`📋 Demo/örnek/test içeren toplam ${demoListings.length} ilan bulundu (ilk 200):\n`);

    if (demoListings.length === 0) {
      console.log('❌ Hiç demo/örnek ilan bulunamadı.');
      console.log('\n🔍 Tüm aktif ilanları kontrol ediliyor...\n');
      
      // Tüm aktif ilanları kontrol et
      const allActiveListings = await prisma.listing.findMany({
        where: {
          isActive: true,
          approvalStatus: 'approved',
        },
        select: {
          id: true,
          title: true,
          category: true,
          user: {
            select: {
              email: true,
            },
          },
        },
        take: 50,
        orderBy: { createdAt: 'desc' },
      });

      console.log(`📊 Toplam ${allActiveListings.length} aktif ilan bulundu (ilk 50):\n`);
      allActiveListings.forEach(l => {
        console.log(`   - ${l.title} (${l.category}) - Kullanıcı: ${l.user?.email || 'Bilinmeyen'}`);
      });
      
      return;
    }

    // Kullanıcılara göre grupla
    const userGroups = {};
    demoListings.forEach(ilan => {
      const userEmail = ilan.user?.email || 'Bilinmeyen';
      if (!userGroups[userEmail]) {
        userGroups[userEmail] = {
          user: ilan.user,
          count: 0,
          listings: [],
        };
      }
      userGroups[userEmail].count++;
      userGroups[userEmail].listings.push(ilan);
    });

    // Her kullanıcı için özet
    console.log('📊 Kullanıcılara göre dağılım:\n');
    Object.keys(userGroups).forEach(email => {
      const group = userGroups[email];
      console.log(`   ${email} (${group.user?.name || 'İsimsiz'}):`);
      console.log(`      - Toplam ${group.count} demo/örnek ilan`);
      group.listings.slice(0, 10).forEach(l => {
        console.log(`        • ${l.title} (${l.category}${l.subCategory ? '/' + l.subCategory : ''}) - ${l.isActive ? 'Aktif' : 'Pasif'} - ${l.approvalStatus}`);
      });
      if (group.count > 10) {
        console.log(`        ... ve ${group.count - 10} ilan daha`);
      }
      console.log('');
    });

    // Aktif ve onaylanmış olanları say
    const aktifOnayli = demoListings.filter(l => l.isActive && l.approvalStatus === 'approved');
    console.log(`\n📊 Özet:`);
    console.log(`   - Toplam demo/örnek ilan: ${demoListings.length}`);
    console.log(`   - Aktif ve onaylanmış: ${aktifOnayli.length}`);
    console.log(`   - Farklı kullanıcı sayısı: ${Object.keys(userGroups).length}`);

    // Admin'in ilanlarını ayrı göster
    if (adminUser) {
      const adminListings = demoListings.filter(l => l.user?.id === adminUser.id);
      console.log(`\n👤 Admin kullanıcısının demo/örnek ilanları: ${adminListings.length}`);
    }

  } catch (error) {
    console.error('\n❌ Hata:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllDemoListings();

