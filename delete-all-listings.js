const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAllListings() {
  try {
    console.log('Tüm ilanlar siliniyor...');

    // Tüm ilanları say
    const count = await prisma.listing.count();
    console.log(`Toplam ${count} ilan bulundu.`);

    if (count === 0) {
      console.log('Silinecek ilan yok.');
      return;
    }

    // Tüm ilanları sil
    const result = await prisma.listing.deleteMany({});

    console.log(`✅ ${result.count} ilan başarıyla silindi!`);

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllListings();

