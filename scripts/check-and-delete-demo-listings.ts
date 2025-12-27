import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndDeleteDemoListings() {
  try {
    console.log('🔍 Demo/örnek ilanlar kontrol ediliyor...\n');

    // 1. Admin kullanıcısını bul
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@alo17.tr' },
    });

    let adminListings: any[] = [];
    if (adminUser) {
      adminListings = await prisma.listing.findMany({
        where: {
          userId: adminUser.id,
        },
        select: {
          id: true,
          title: true,
          category: true,
          createdAt: true,
        },
      });
      console.log(`📋 Admin kullanıcısına ait ${adminListings.length} ilan bulundu.`);
      if (adminListings.length > 0) {
        adminListings.forEach(l => {
          console.log(`   - ${l.title} (${l.category})`);
        });
      }
    } else {
      console.log('⚠️  Admin kullanıcısı bulunamadı.');
    }

    // 2. Demo/örnek/test içeren başlıklara sahip ilanları bul
    const demoListings = await prisma.listing.findMany({
      where: {
        OR: [
          { title: { contains: 'Demo', mode: 'insensitive' } },
          { title: { contains: 'Örnek', mode: 'insensitive' } },
          { title: { contains: 'Test', mode: 'insensitive' } },
          { title: { contains: 'örnek', mode: 'insensitive' } },
          { title: { contains: 'demo', mode: 'insensitive' } },
          { title: { contains: 'test', mode: 'insensitive' } },
          { brand: { contains: 'Demo', mode: 'insensitive' } },
          { brand: { contains: 'örnek', mode: 'insensitive' } },
          { model: { contains: 'Demo', mode: 'insensitive' } },
          { model: { contains: 'örnek', mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        category: true,
        createdAt: true,
      },
    });

    console.log(`\n📋 Demo/örnek/test içeren ${demoListings.length} ilan bulundu.`);
    if (demoListings.length > 0) {
      demoListings.forEach(l => {
        console.log(`   - ${l.title} (${l.category})`);
      });
    }

    // 3. Tüm demo ilan ID'lerini birleştir
    const allDemoListingIds = [
      ...adminListings.map(l => l.id),
      ...demoListings.map(l => l.id),
    ];

    // Tekrarları kaldır
    const uniqueIds = Array.from(new Set(allDemoListingIds));

    console.log(`\n📊 Toplam ${uniqueIds.length} benzersiz demo/örnek ilan bulundu.`);

    if (uniqueIds.length === 0) {
      console.log('\n✅ Silinecek demo/örnek ilan bulunamadı.');
      return;
    }

    // 4. Kullanıcıya onay iste
    console.log('\n⚠️  Aşağıdaki ilanlar silinecek:');
    const allListings = [...adminListings, ...demoListings];
    const uniqueListings = allListings.filter((l, index, self) => 
      index === self.findIndex(t => t.id === l.id)
    );
    uniqueListings.forEach(l => {
      console.log(`   - ${l.title} (ID: ${l.id})`);
    });

    // 5. İlanları sil
    console.log('\n🗑️  İlanlar siliniyor...');
    const result = await prisma.listing.deleteMany({
      where: {
        id: {
          in: uniqueIds,
        },
      },
    });

    console.log(`\n✅ ${result.count} demo/örnek ilan başarıyla silindi.`);
    
    // 6. İlişkili kayıtları temizle
    console.log('\n🧹 İlişkili kayıtlar temizleniyor...');
    
    // Favorilerden kaldır
    const favoriteResult = await prisma.userFavorite.deleteMany({
      where: {
        listingId: {
          in: uniqueIds,
        },
      },
    });
    console.log(`   - ${favoriteResult.count} favori kaydı silindi.`);

    // Mesajlardan listingId'yi null yap
    const messageResult = await prisma.message.updateMany({
      where: {
        listingId: {
          in: uniqueIds,
        },
      },
      data: {
        listingId: null,
      },
    });
    console.log(`   - ${messageResult.count} mesaj kaydı güncellendi.`);

    console.log('\n✅ Tüm işlemler tamamlandı!');
  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkAndDeleteDemoListings()
  .then(() => {
    console.log('\n✅ Script başarıyla tamamlandı.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script hatası:', error);
    process.exit(1);
  });

