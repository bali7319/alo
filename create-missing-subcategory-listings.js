const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const missingSubcategoryExamples = {
  // Hizmetler alt kategorileri
  'Güvenlik': {
    title: 'Güvenlik Hizmeti',
    description: '7/24 güvenlik hizmeti. Ev, ofis ve işyerleri için profesyonel güvenlik.',
    price: 300,
    features: ['7/24 hizmet', 'Profesyonel personel', 'Sigortalı hizmet']
  },
  'Tasarım': {
    title: 'Grafik Tasarım Hizmeti',
    description: 'Logo, kartvizit, broşür tasarımı. Kurumsal kimlik tasarımı.',
    price: 400,
    features: ['Logo tasarımı', 'Kartvizit tasarımı', 'Broşür tasarımı']
  },

  // Ev & Bahçe alt kategorileri
  'Aydınlatma': {
    title: 'LED Aydınlatma Seti',
    description: 'Enerji tasarruflu LED aydınlatma seti. Ev ve ofis için uygun.',
    price: 250,
    features: ['Enerji tasarruflu', 'Uzun ömürlü', 'Kolay montaj']
  },
  'Bahçe Aletleri': {
    title: 'Bahçe Aletleri Seti',
    description: 'Tam bahçe aletleri seti. Çim biçme makinesi, tırmık, kürek dahil.',
    price: 800,
    features: ['Çim biçme makinesi', 'Tırmık', 'Kürek', 'Bahçe makası']
  },
  'Beyaz Eşya': {
    title: 'Bulaşık Makinesi',
    description: '12 kişilik bulaşık makinesi. A+ enerji sınıfı.',
    price: 3500,
    features: ['12 kişilik', 'A+ enerji', 'Garantili']
  },
  'Dekorasyon': {
    title: 'Dekoratif Yastık Seti',
    description: 'Ev dekorasyonu için yastık seti. 4 adet dekoratif yastık.',
    price: 120,
    features: ['4 adet yastık', 'Dekoratif', 'Kolay temizlik']
  },
  'Güvenlik': {
    title: 'Ev Güvenlik Sistemi',
    description: 'Kablosuz ev güvenlik sistemi. Hareket sensörü ve kamera dahil.',
    price: 1500,
    features: ['Kablosuz sistem', 'Hareket sensörü', 'Kamera', 'Uzaktan erişim']
  },
  'Isıtma/Soğutma': {
    title: 'Klima',
    description: '12.000 BTU klima. A+ enerji sınıfı, inverter teknolojisi.',
    price: 8000,
    features: ['12.000 BTU', 'A+ enerji', 'Inverter', 'Garantili']
  },
  'Mutfak Gereçleri': {
    title: 'Mutfak Seti',
    description: 'Tam mutfak seti. Tencere, tava, çatal bıçak takımı.',
    price: 600,
    features: ['Tencere seti', 'Tava seti', 'Çatal bıçak takımı', 'Kaliteli malzeme']
  },
  'Temizlik': {
    title: 'Elektrikli Süpürge',
    description: 'Kablosuz elektrikli süpürge. HEPA filtreli.',
    price: 1200,
    features: ['Kablosuz', 'HEPA filtre', 'Uzun pil ömrü', 'Kolay kullanım']
  },

  // Giyim alt kategorileri
  'Aksesuar': {
    title: 'Kadın Çanta Seti',
    description: '3 adet kadın çanta seti. Günlük, akşam ve spor çantası.',
    price: 350,
    features: ['3 adet çanta', 'Günlük kullanım', 'Kaliteli malzeme']
  },
  'Ayakkabı & Çanta': {
    title: 'Ayakkabı Çanta Seti',
    description: 'Kadın ayakkabı ve çanta seti. Uyumlu renkler.',
    price: 280,
    features: ['Ayakkabı', 'Çanta', 'Uyumlu renkler', 'Kaliteli malzeme']
  },
  'Bayan Giyim': {
    title: 'Kadın Elbise',
    description: 'Şık kadın elbise. Özel günler için uygun.',
    price: 450,
    features: ['Şık tasarım', 'Kaliteli kumaş', 'Özel günler']
  },
  'Çocuk Giyim': {
    title: 'Çocuk Giyim Seti',
    description: 'Çocuk giyim seti. 5 adet üst ve alt giyim.',
    price: 200,
    features: ['5 adet giyim', 'Rahat kumaş', 'Çeşitli renkler']
  },
  'Kadın': {
    title: 'Kadın Giyim Koleksiyonu',
    description: 'Kadın giyim koleksiyonu. Elbise, bluz ve pantolon.',
    price: 600,
    features: ['Elbise', 'Bluz', 'Pantolon', 'Uyumlu setler']
  },
  'Kadın Giyim': {
    title: 'Kadın Bluz',
    description: 'Şık kadın bluz. Ofis ve günlük kullanım için.',
    price: 180,
    features: ['Şık tasarım', 'Ofis uyumlu', 'Kolay ütüleme']
  },

  // Moda & Stil alt kategorileri
  'Çocuk': {
    title: 'Çocuk Moda Seti',
    description: 'Çocuk moda seti. Trend tasarımlar.',
    price: 250,
    features: ['Trend tasarım', 'Kaliteli malzeme', 'Rahat kullanım']
  },
  'Erkek': {
    title: 'Erkek Moda Seti',
    description: 'Erkek moda seti. Gömlek, pantolon ve aksesuar.',
    price: 400,
    features: ['Gömlek', 'Pantolon', 'Aksesuar', 'Uyumlu set']
  },
  'Kadın': {
    title: 'Kadın Moda Seti',
    description: 'Kadın moda seti. Elbise, çanta ve aksesuar.',
    price: 500,
    features: ['Elbise', 'Çanta', 'Aksesuar', 'Trend tasarım']
  }
};

async function createMissingSubcategoryListings() {
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

    for (const [subcategory, example] of Object.entries(missingSubcategoryExamples)) {
      // Bu alt kategoride zaten ilan var mı kontrol et
      const existingListing = await prisma.listing.findFirst({
        where: {
          subCategory: subcategory
        }
      });

      if (!existingListing) {
        // Ana kategoriyi belirle
        let mainCategory = 'Diğer';
        if (['Güvenlik', 'Tasarım'].includes(subcategory)) {
          mainCategory = 'Hizmetler';
        } else if (['Aydınlatma', 'Bahçe Aletleri', 'Beyaz Eşya', 'Dekorasyon', 'Güvenlik', 'Isıtma/Soğutma', 'Mutfak Gereçleri', 'Temizlik'].includes(subcategory)) {
          mainCategory = 'Ev & Bahçe';
        } else if (['Aksesuar', 'Ayakkabı & Çanta', 'Bayan Giyim', 'Çocuk Giyim', 'Kadın', 'Kadın Giyim'].includes(subcategory)) {
          mainCategory = 'Giyim';
        } else if (['Çocuk', 'Erkek', 'Kadın'].includes(subcategory)) {
          mainCategory = 'Moda & Stil';
        }

        const listing = await prisma.listing.create({
          data: {
            title: example.title,
            description: example.description,
            price: example.price,
            location: 'İstanbul',
            category: mainCategory,
            subCategory: subcategory,
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

        console.log(`${subcategory} alt kategorisi için ilan oluşturuldu:`, listing.id);
      } else {
        console.log(`${subcategory} alt kategorisinde zaten ilan var:`, existingListing.id);
      }
    }

    console.log('Eksik alt kategori ilanları oluşturma tamamlandı!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMissingSubcategoryListings(); 