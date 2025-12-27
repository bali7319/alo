import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDemoListings() {
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
          approvalStatus: true,
          isActive: true,
        },
      });
      console.log(`📋 Admin kullanıcısına ait ${adminListings.length} ilan bulundu.`);
      if (adminListings.length > 0) {
        adminListings.forEach(l => {
          console.log(`   - ${l.title} (${l.category}) - ${l.approvalStatus} - ${l.isActive ? 'Aktif' : 'Pasif'}`);
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
        approvalStatus: true,
        isActive: true,
      },
    });

    console.log(`\n📋 Demo/örnek/test içeren ${demoListings.length} ilan bulundu.`);
    if (demoListings.length > 0) {
      demoListings.forEach(l => {
        console.log(`   - ${l.title} (${l.category}) - ${l.approvalStatus} - ${l.isActive ? 'Aktif' : 'Pasif'}`);
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

    // 4. Tüm ilanları birleştir (tekrarları kaldırarak)
    const allListings = [...adminListings, ...demoListings];
    const uniqueListings = allListings.filter((l, index, self) => 
      index === self.findIndex(t => t.id === l.id)
    );

    console.log('\n📝 Bulunan ilanlar:');
    uniqueListings.forEach((l, index) => {
      console.log(`   ${index + 1}. ${l.title}`);
      console.log(`      ID: ${l.id}`);
      console.log(`      Kategori: ${l.category}`);
      console.log(`      Durum: ${l.approvalStatus} - ${l.isActive ? 'Aktif' : 'Pasif'}`);
      console.log(`      Oluşturulma: ${l.createdAt.toISOString()}`);
      console.log('');
    });

    console.log(`\n⚠️  Toplam ${uniqueIds.length} ilan silinecek.`);
    console.log('💡 Silmek için: DELETE /api/admin/check-demo-listings endpoint\'ini kullanın veya script/delete-demo-listings.ts çalıştırın.');

  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testDemoListings()
  .then(() => {
    console.log('\n✅ Kontrol tamamlandı.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Hata:', error);
    process.exit(1);
  });

