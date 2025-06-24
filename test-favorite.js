const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFavorite() {
  try {
    // Test kullanıcısını bul
    const user = await prisma.user.findUnique({
      where: { email: 'test@alo17.tr' }
    });

    if (!user) {
      console.log('Test kullanıcısı bulunamadı');
      return;
    }

    console.log('Test kullanıcısı:', user.id);

    // İlk ilanı bul
    const listing = await prisma.listing.findFirst();

    if (!listing) {
      console.log('Hiç ilan bulunamadı');
      return;
    }

    console.log('İlan bulundu:', listing.id);

    // Favori ekle
    const favorite = await prisma.userFavorite.create({
      data: {
        userId: user.id,
        listingId: listing.id,
      },
    });

    console.log('Favori eklendi:', favorite);

    // Favori durumunu kontrol et
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId: listing.id,
        },
      },
    });

    console.log('Favori durumu:', existingFavorite ? 'Var' : 'Yok');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFavorite(); 