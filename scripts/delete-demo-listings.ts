import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteDemoListings() {
  try {
    console.log('Demo ilanlar siliniyor...');

    // Admin kullanıcısını bul
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@alo17.tr' },
    });

    if (!adminUser) {
      console.log('Admin kullanıcısı bulunamadı.');
      return;
    }

    // Admin kullanıcısına ait tüm ilanları bul
    const adminListings = await prisma.listing.findMany({
      where: {
        userId: adminUser.id,
      },
      select: {
        id: true,
        title: true,
      },
    });

    console.log(`Admin kullanıcısına ait ${adminListings.length} ilan bulundu.`);

    // Demo içeren başlıklara sahip ilanları bul (PostgreSQL için)
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
      },
    });

    console.log(`Demo içeren ${demoListings.length} ilan bulundu.`);

    // Tüm demo ilan ID'lerini birleştir
    const allDemoListingIds = [
      ...adminListings.map(l => l.id),
      ...demoListings.map(l => l.id),
    ];

    // Tekrarları kaldır
    const uniqueIds = Array.from(new Set(allDemoListingIds));

    console.log(`Toplam ${uniqueIds.length} benzersiz demo ilan silinecek.`);

    if (uniqueIds.length === 0) {
      console.log('Silinecek demo ilan bulunamadı.');
      return;
    }

    // İlişkili kayıtları temizle
    console.log('İlişkili kayıtlar temizleniyor...');
    
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

    // İlanları sil
    const result = await prisma.listing.deleteMany({
      where: {
        id: {
          in: uniqueIds,
        },
      },
    });

    console.log(`✅ ${result.count} demo ilan başarıyla silindi.`);
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteDemoListings();

