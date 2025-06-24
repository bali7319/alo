const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixGuvenlikListing() {
  try {
    // Hizmetler kategorisinde güvenlik alt kategorisindeki ilanı bul
    const listing = await prisma.listing.findFirst({
      where: {
        category: 'Hizmetler',
        subCategory: 'Güvenlik'
      }
    });

    if (listing) {
      // İlanı güncelle
      const updatedListing = await prisma.listing.update({
        where: { id: listing.id },
        data: {
          title: 'Güvenlik Hizmeti',
          description: '7/24 güvenlik hizmeti. Ev, ofis ve işyerleri için profesyonel güvenlik personeli. Sigortalı ve güvenilir hizmet.',
          price: 300,
          features: JSON.stringify(['7/24 hizmet', 'Profesyonel personel', 'Sigortalı hizmet', 'Ev güvenliği', 'Ofis güvenliği'])
        }
      });

      console.log('Güvenlik ilanı güncellendi:', updatedListing.title);
    } else {
      console.log('Güvenlik ilanı bulunamadı!');
    }

    // Kontrol et
    const checkListing = await prisma.listing.findFirst({
      where: {
        category: 'Hizmetler',
        subCategory: 'Güvenlik'
      }
    });

    if (checkListing) {
      console.log('Kontrol: İlan bulundu:', checkListing.title);
      console.log('Fiyat:', checkListing.price, 'TL');
    } else {
      console.log('Kontrol: İlan bulunamadı!');
    }

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixGuvenlikListing(); 