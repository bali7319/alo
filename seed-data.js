const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedData() {
  try {
    console.log('Örnek veriler ekleniyor...');

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: 'destek@alo17.tr' }
    });

    if (!user) {
      console.log('Kullanıcı bulunamadı. Önce test-user.js çalıştırın.');
      return;
    }

    // Örnek ilanlar
    const sampleListings = [
      {
        title: 'iPhone 14 Pro Max - Mükemmel Durumda',
        description: '1 yıl kullanılmış iPhone 14 Pro Max, 256GB, Uzay Grisi. Kutulu, şarj aleti dahil. Hiçbir çizik yok.',
        price: 35000,
        location: 'İstanbul',
        category: 'elektronik',
        subCategory: 'telefon',
        phone: '0541 404 2 404',
        showPhone: true,
        images: ['/images/listings/placeholder-1.jpg'],
        features: JSON.stringify(['256GB', 'Uzay Grisi', 'Kutulu', 'Şarj Aleti Dahil']),
        condition: 'Çok İyi',
        brand: 'Apple',
        model: 'iPhone 14 Pro Max',
        year: '2023',
        isPremium: true,
        premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 gün
        views: 45,
        isActive: true,
        approvalStatus: 'approved',
        userId: user.id
      },
      {
        title: 'MacBook Air M2 - Yeni Gibi',
        description: '6 ay kullanılmış MacBook Air M2, 8GB RAM, 256GB SSD. Çok az kullanıldı, mükemmel durumda.',
        price: 45000,
        location: 'Ankara',
        category: 'elektronik',
        subCategory: 'bilgisayar',
        phone: '0541 404 2 404',
        showPhone: true,
        images: ['/images/listings/placeholder-1.jpg'],
        features: JSON.stringify(['M2 Chip', '8GB RAM', '256GB SSD', '13.6 inch']),
        condition: 'Mükemmel',
        brand: 'Apple',
        model: 'MacBook Air M2',
        year: '2023',
        isPremium: false,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 gün
        views: 23,
        isActive: true,
        approvalStatus: 'approved',
        userId: user.id
      },
      {
        title: 'Samsung 55" Smart TV - 4K',
        description: '2 yıl kullanılmış Samsung 55" 4K Smart TV. Uzaktan kumanda dahil, sorunsuz çalışıyor.',
        price: 12000,
        location: 'İzmir',
        category: 'elektronik',
        subCategory: 'televizyon',
        phone: '0541 404 2 404',
        showPhone: true,
        images: ['/images/listings/placeholder-1.jpg'],
        features: JSON.stringify(['55 inch', '4K', 'Smart TV', 'Uzaktan Kumanda']),
        condition: 'İyi',
        brand: 'Samsung',
        model: '55" 4K Smart TV',
        year: '2022',
        isPremium: true,
        premiumUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 gün
        expiresAt: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // 75 gün
        views: 67,
        isActive: true,
        approvalStatus: 'approved',
        userId: user.id
      },
      {
        title: 'Nike Air Max 270 - Erkek Spor Ayakkabı',
        description: 'Yeni, hiç giyilmemiş Nike Air Max 270. 42 numara, siyah renk. Kutulu.',
        price: 2500,
        location: 'Bursa',
        category: 'giyim',
        subCategory: 'ayakkabi',
        phone: '0541 404 2 404',
        showPhone: true,
        images: ['/images/listings/placeholder-1.jpg'],
        features: JSON.stringify(['42 Numara', 'Siyah', 'Kutulu', 'Yeni']),
        condition: 'Yeni',
        brand: 'Nike',
        model: 'Air Max 270',
        year: '2024',
        isPremium: false,
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 gün
        views: 12,
        isActive: true,
        approvalStatus: 'approved',
        userId: user.id
      },
      {
        title: 'IKEA Koltuk Takımı - 3+3+1',
        description: '3 yıl kullanılmış IKEA koltuk takımı. Gri renk, çok temiz. Taşıma dahil.',
        price: 8000,
        location: 'Antalya',
        category: 'ev-esyalari',
        subCategory: 'mobilya',
        phone: '0541 404 2 404',
        showPhone: true,
        images: ['/images/listings/placeholder-1.jpg'],
        features: JSON.stringify(['3+3+1', 'Gri Renk', 'Taşıma Dahil', 'Temiz']),
        condition: 'İyi',
        brand: 'IKEA',
        model: 'Koltuk Takımı',
        year: '2021',
        isPremium: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
        views: 8,
        isActive: true,
        approvalStatus: 'approved',
        userId: user.id
      },
      {
        title: 'PlayStation 5 - Digital Edition',
        description: '1 yıl kullanılmış PS5 Digital Edition. 2 kumanda, 3 oyun dahil. Mükemmel durumda.',
        price: 18000,
        location: 'İstanbul',
        category: 'elektronik',
        subCategory: 'oyun-konsollari',
        phone: '0541 404 2 404',
        showPhone: true,
        images: ['/images/listings/placeholder-1.jpg'],
        features: JSON.stringify(['Digital Edition', '2 Kumanda', '3 Oyun', 'Kutulu']),
        condition: 'Mükemmel',
        brand: 'Sony',
        model: 'PlayStation 5 Digital',
        year: '2023',
        isPremium: true,
        premiumUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 gün
        expiresAt: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000), // 80 gün
        views: 89,
        isActive: true,
        approvalStatus: 'approved',
        userId: user.id
      },
      // YENİ EKLENEN 3 İLAN
      {
        title: 'Canon EOS R6 Mark II - Profesyonel Kamera',
        description: 'Yeni Canon EOS R6 Mark II, 24.2MP, 4K video, 5-axis stabilizasyon. Lens dahil değil.',
        price: 52000,
        location: 'İstanbul',
        category: 'elektronik',
        subCategory: 'fotograf-makineleri',
        phone: '0541 404 2 404',
        showPhone: true,
        images: ['/images/listings/placeholder-1.jpg'],
        features: JSON.stringify(['24.2MP', '4K Video', '5-Axis Stabilizasyon', 'RF Mount']),
        condition: 'Yeni',
        brand: 'Canon',
        model: 'EOS R6 Mark II',
        year: '2024',
        isPremium: true,
        premiumUntil: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 gün
        expiresAt: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000), // 85 gün
        views: 156,
        isActive: true,
        approvalStatus: 'approved',
        userId: user.id
      },
      {
        title: 'Adidas Ultraboost 22 - Koşu Ayakkabısı',
        description: 'Adidas Ultraboost 22, 44 numara, mavi renk. Sadece 2 kez giyildi, neredeyse yeni.',
        price: 3200,
        location: 'İzmir',
        category: 'giyim',
        subCategory: 'ayakkabi',
        phone: '0541 404 2 404',
        showPhone: true,
        images: ['/images/listings/placeholder-1.jpg'],
        features: JSON.stringify(['44 Numara', 'Mavi', 'Boost Teknolojisi', 'Koşu']),
        condition: 'Çok İyi',
        brand: 'Adidas',
        model: 'Ultraboost 22',
        year: '2023',
        isPremium: false,
        expiresAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // 40 gün
        views: 34,
        isActive: true,
        approvalStatus: 'approved',
        userId: user.id
      },
      {
        title: 'Bosch Buzdolabı - A+++ Enerji',
        description: 'Bosch KGN39XWPA A+++ 388L buzdolabı. Beyaz, NoFrost teknolojisi, 2 yıl garantili.',
        price: 18500,
        location: 'Ankara',
        category: 'ev-esyalari',
        subCategory: 'beyaz-esya',
        phone: '0541 404 2 404',
        showPhone: true,
        images: ['/images/listings/placeholder-1.jpg'],
        features: JSON.stringify(['388L Kapasite', 'A+++ Enerji', 'NoFrost', '2 Yıl Garanti']),
        condition: 'Yeni',
        brand: 'Bosch',
        model: 'KGN39XWPA',
        year: '2024',
        isPremium: true,
        premiumUntil: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 gün
        expiresAt: new Date(Date.now() + 95 * 24 * 60 * 60 * 1000), // 95 gün
        views: 78,
        isActive: true,
        approvalStatus: 'approved',
        userId: user.id
      }
    ];

    // İlanları ekle
    for (const listing of sampleListings) {
      await prisma.listing.create({
        data: listing
      });
    }

    console.log('✅ Örnek ilanlar başarıyla eklendi!');
    console.log(`📊 Toplam ${sampleListings.length} ilan eklendi.`);
    console.log('\n🔗 http://localhost:3000 adresinden siteyi görüntüleyebilirsiniz.');
    console.log('👤 Giriş bilgileri: destek@alo17.tr / 123456');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData(); 