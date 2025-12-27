// "Örnek İlan" içeren tüm ilanları detaylı kontrol et
// Kullanım: node scripts/check-ornek-ilanlar-detayli.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrnekIlanlar() {
  try {
    console.log('🔍 "Örnek İlan" içeren tüm ilanlar kontrol ediliyor...\n');

    // Admin kullanıcısını bul
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@alo17.tr' },
      select: { id: true, email: true, name: true },
    });

    if (adminUser) {
      console.log(`✅ Admin kullanıcısı: ${adminUser.email} (ID: ${adminUser.id})\n`);
      
      // Admin'in tüm ilanlarını say
      const adminListingsCount = await prisma.listing.count({
        where: { userId: adminUser.id },
      });
      console.log(`📊 Admin kullanıcısına ait toplam ${adminListingsCount} ilan var.\n`);
    } else {
      console.log('⚠️  Admin kullanıcısı bulunamadı.\n');
    }

    // "Örnek İlan" içeren TÜM ilanları bul (kullanıcı bilgisi ile)
    const ornekIlanlar = await prisma.listing.findMany({
      where: {
        OR: [
          { title: { contains: 'Örnek İlan', mode: 'insensitive' } },
          { title: { contains: 'örnek ilan', mode: 'insensitive' } },
          { title: { contains: 'Örnek', mode: 'insensitive' } },
          { title: { contains: 'örnek', mode: 'insensitive' } },
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
    });

    console.log(`📋 "Örnek İlan" içeren toplam ${ornekIlanlar.length} ilan bulundu:\n`);

    // Kullanıcılara göre grupla
    const userGroups = {};
    ornekIlanlar.forEach(ilan => {
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
      console.log(`      - Toplam ${group.count} "Örnek İlan"`);
      if (group.count <= 10) {
        group.listings.forEach(l => {
          console.log(`        • ${l.title} (${l.category}${l.subCategory ? '/' + l.subCategory : ''}) - ${l.isActive ? 'Aktif' : 'Pasif'} - ${l.approvalStatus}`);
        });
      } else {
        group.listings.slice(0, 5).forEach(l => {
          console.log(`        • ${l.title} (${l.category}${l.subCategory ? '/' + l.subCategory : ''})`);
        });
        console.log(`        ... ve ${group.count - 5} ilan daha`);
      }
      console.log('');
    });

    // Aktif ve onaylanmış olanları say
    const aktifOnayli = ornekIlanlar.filter(l => l.isActive && l.approvalStatus === 'approved');
    console.log(`\n📊 Özet:`);
    console.log(`   - Toplam "Örnek İlan": ${ornekIlanlar.length}`);
    console.log(`   - Aktif ve onaylanmış: ${aktifOnayli.length}`);
    console.log(`   - Farklı kullanıcı sayısı: ${Object.keys(userGroups).length}`);

    // Admin'in ilanlarını ayrı göster
    if (adminUser) {
      const adminOrnekIlanlar = ornekIlanlar.filter(l => l.user?.id === adminUser.id);
      console.log(`\n👤 Admin kullanıcısının "Örnek İlan"ları: ${adminOrnekIlanlar.length}`);
    }

  } catch (error) {
    console.error('\n❌ Hata:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrnekIlanlar();

