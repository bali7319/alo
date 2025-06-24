const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createGuvenlikListing() {
  try {
    // Test kullanıcısını bul
    let user = await prisma.user.findUnique({
      where: { email: 'test@alo17.tr' }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Test Kullanıcı',
          email: 'test@alo17.tr',
          password: 'test123'
        }
      });
    }

    console.log('Test kullanıcısı:', user.id);

    // Hizmetler kategorisinde güvenlik alt kategorisi için ilan var mı kontrol et
    const existingListing = await prisma.listing.findFirst({
      where: {
        category: 'Hizmetler',
        subCategory: 'Güvenlik'
      }
    });

    if (!existingListing) {
      const listing = await prisma.listing.create({
        data: {
          title: 'Güvenlik Hizmeti',
          description: '7/24 güvenlik hizmeti. Ev, ofis ve işyerleri için profesyonel güvenlik personeli. Sigortalı ve güvenilir hizmet.',
          price: 300,
          location: 'İstanbul',
          category: 'Hizmetler',
          subCategory: 'Güvenlik',
          subSubCategory: null,
          phone: '0555 123 4567',
          showPhone: true,
          images: JSON.stringify(['/images/placeholder.jpg']),
          features: JSON.stringify(['7/24 hizmet', 'Profesyonel personel', 'Sigortalı hizmet', 'Ev güvenliği', 'Ofis güvenliği']),
          condition: 'Yeni',
          brand: '-',
          model: '-',
          year: '2024',
          isPremium: false,
          premiumFeatures: null,
          premiumUntil: null,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün sonra
          views: 0,
          isActive: true,
          approvalStatus: 'approved',
          userId: user.id
        }
      });

      console.log('Hizmetler > Güvenlik kategorisi için ilan oluşturuldu:', listing.id);
    } else {
      console.log('Hizmetler > Güvenlik kategorisinde zaten ilan var:', existingListing.id);
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
    } else {
      console.log('Kontrol: İlan bulunamadı!');
    }

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createGuvenlikListing(); 