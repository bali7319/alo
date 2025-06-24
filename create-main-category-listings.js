const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const mainCategories = [
  'İş',
  'Hizmetler', 
  'Elektronik',
  'Ev & Bahçe',
  'Giyim',
  'Moda & Stil',
  'Sporlar, Oyunlar ve Eğlenceler',
  'Anne & Bebek',
  'Çocuk Dünyası',
  'Eğitim & Kurslar',
  'Yemek & İçecek',
  'Catering & Ticaret',
  'Turizm & Konaklama',
  'Sağlık & Güzellik',
  'Sanat & Hobi',
  'Ücretsiz Gel Al',
  'Diğer'
];

const categoryExamples = {
  'İş': {
    title: 'Grafik Tasarımcı Aranıyor',
    description: 'Deneyimli grafik tasarımcı aranıyor. Adobe Creative Suite bilgisi gerekli.',
    price: 8000,
    features: ['Uzaktan çalışma', 'Esnek saatler', 'Deneyim gerekli']
  },
  'Hizmetler': {
    title: 'Profesyonel Temizlik Hizmeti',
    description: 'Ev ve ofis temizlik hizmeti. Güvenilir ve deneyimli ekibimizle hizmetinizdeyiz.',
    price: 200,
    features: ['Profesyonel ekip', 'Sigortalı hizmet', '7/24 destek']
  },
  'Elektronik': {
    title: 'iPhone 14 Pro - 128GB',
    description: 'Az kullanılmış iPhone 14 Pro. Garantisi devam ediyor.',
    price: 25000,
    features: ['128GB', 'Garantili', 'Kutusu ile birlikte']
  },
  'Ev & Bahçe': {
    title: 'Bahçe Mobilyası Seti',
    description: 'Ahşap bahçe mobilyası seti. 6 kişilik masa ve sandalyeler.',
    price: 1500,
    features: ['Ahşap malzeme', '6 kişilik', 'Su geçirmez']
  },
  'Giyim': {
    title: 'Kadın Kış Montu',
    description: 'Kaliteli kış montu. Sıcak tutar ve şık görünür.',
    price: 800,
    features: ['Su geçirmez', 'Çoklu cep', 'Kapüşonlu']
  },
  'Moda & Stil': {
    title: 'El Yapımı Takı Seti',
    description: 'El yapımı gümüş takı seti. Benzersiz tasarım.',
    price: 300,
    features: ['El yapımı', 'Gümüş', 'Benzersiz tasarım']
  },
  'Sporlar, Oyunlar ve Eğlenceler': {
    title: 'Fitness Ekipmanları Seti',
    description: 'Ev için fitness ekipmanları. Dumbbell, yoga matı ve direnç bandı.',
    price: 500,
    features: ['Tam set', 'Ev kullanımı', 'Kullanım kılavuzu']
  },
  'Anne & Bebek': {
    title: 'Bebek Arabası Premium',
    description: 'Katlanabilir bebek arabası. Güvenli ve konforlu.',
    price: 1200,
    features: ['Katlanabilir', 'Güvenlik kemeri', 'Güneşlikli']
  },
  'Çocuk Dünyası': {
    title: 'Eğitici Oyuncak Seti',
    description: 'Çocuklar için eğitici oyuncak seti. Yaş grubu 3-6.',
    price: 150,
    features: ['Eğitici', 'Güvenli malzeme', '3-6 yaş']
  },
  'Eğitim & Kurslar': {
    title: 'İngilizce Özel Ders',
    description: 'Deneyimli öğretmenden İngilizce özel ders. Her seviye.',
    price: 100,
    features: ['Özel ders', 'Her seviye', 'Esnek saat']
  },
  'Yemek & İçecek': {
    title: 'Ev Yapımı Pasta',
    description: 'Özel günler için ev yapımı pasta. Sipariş üzerine hazırlanır.',
    price: 80,
    features: ['Ev yapımı', 'Özel sipariş', 'Taze malzeme']
  },
  'Catering & Ticaret': {
    title: 'Düğün Catering Hizmeti',
    description: 'Profesyonel düğün catering hizmeti. Menü seçenekleri mevcuttur.',
    price: 150,
    features: ['Profesyonel', 'Menü seçenekleri', 'Servis dahil']
  },
  'Turizm & Konaklama': {
    title: 'Deniz Manzaralı Villa',
    description: 'Haftalık kiralık villa. Deniz manzarası ve özel havuz.',
    price: 5000,
    features: ['Deniz manzarası', 'Özel havuz', 'Haftalık kiralık']
  },
  'Sağlık & Güzellik': {
    title: 'Cilt Bakım Seti',
    description: 'Profesyonel cilt bakım seti. Tüm cilt tipleri için uygun.',
    price: 250,
    features: ['Profesyonel', 'Tüm cilt tipleri', 'Doğal içerik']
  },
  'Sanat & Hobi': {
    title: 'El Yapımı Seramik Vazo',
    description: 'El yapımı seramik vazo. Benzersiz tasarım.',
    price: 180,
    features: ['El yapımı', 'Benzersiz', 'Seramik']
  },
  'Ücretsiz Gel Al': {
    title: 'Eski Kitaplar - Ücretsiz',
    description: 'Eski kitaplar ücretsiz verilecek. Gel alabilirsiniz.',
    price: 0,
    features: ['Ücretsiz', 'Gel al', 'Çeşitli kitaplar']
  },
  'Diğer': {
    title: 'Çeşitli Eşyalar',
    description: 'Çeşitli eşyalar satılık. İncelemek için gelin.',
    price: 50,
    features: ['Çeşitli', 'İnceleme', 'Uygun fiyat']
  }
};

async function createMainCategoryListings() {
  try {
    // Test kullanıcısını bul veya oluştur
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

    for (const category of mainCategories) {
      // Bu kategoride zaten ilan var mı kontrol et
      const existingListing = await prisma.listing.findFirst({
        where: {
          category: category,
          subCategory: null
        }
      });

      if (!existingListing) {
        const example = categoryExamples[category];
        
        const listing = await prisma.listing.create({
          data: {
            title: example.title,
            description: example.description,
            price: example.price,
            location: 'İstanbul',
            category: category,
            subCategory: null,
            subSubCategory: null,
            phone: '0555 123 4567',
            showPhone: true,
            images: JSON.stringify(['/images/placeholder.jpg']),
            features: JSON.stringify(example.features),
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

        console.log(`${category} kategorisi için ilan oluşturuldu:`, listing.id);
      } else {
        console.log(`${category} kategorisinde zaten ilan var:`, existingListing.id);
      }
    }

    console.log('Ana kategori ilanları oluşturma tamamlandı!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMainCategoryListings(); 