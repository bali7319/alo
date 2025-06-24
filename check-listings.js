const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkListings() {
  try {
    // Hizmetler kategorisindeki tüm ilanları kontrol et
    const hizmetlerListings = await prisma.listing.findMany({
      where: {
        category: 'Hizmetler'
      },
      select: {
        id: true,
        title: true,
        subCategory: true,
        price: true
      }
    });

    console.log('Hizmetler kategorisindeki ilanlar:');
    hizmetlerListings.forEach(listing => {
      console.log(`- ${listing.title} (${listing.subCategory || 'Ana kategori'}) - ${listing.price} TL`);
    });

    // Güvenlik alt kategorisindeki ilanları kontrol et
    const guvenlikListings = await prisma.listing.findMany({
      where: {
        subCategory: 'Güvenlik'
      },
      select: {
        id: true,
        title: true,
        category: true,
        price: true
      }
    });

    console.log('\nGüvenlik alt kategorisindeki ilanlar:');
    guvenlikListings.forEach(listing => {
      console.log(`- ${listing.title} (${listing.category}) - ${listing.price} TL`);
    });

    // Toplam ilan sayısını kontrol et
    const totalListings = await prisma.listing.count();
    console.log(`\nToplam ilan sayısı: ${totalListings}`);

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkListings(); 