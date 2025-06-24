const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const subcategoryExamples = {
  // İş alt kategorileri
  'Grafik Tasarım': {
    title: 'Logo Tasarım Hizmeti',
    description: 'Profesyonel logo tasarım hizmeti. Kurumsal kimlik için uygun.',
    price: 500,
    features: ['Profesyonel tasarım', 'Vektörel format', 'Revizyon hakkı']
  },
  'Web Tasarım': {
    title: 'Web Sitesi Tasarımı',
    description: 'Modern ve responsive web sitesi tasarımı.',
    price: 2000,
    features: ['Responsive tasarım', 'SEO uyumlu', 'Yönetim paneli']
  },
  'Muhasebe': {
    title: 'Muhasebe Hizmeti',
    description: 'Kurumsal muhasebe hizmeti. Vergi beyannameleri dahil.',
    price: 800,
    features: ['Vergi beyannameleri', 'Aylık raporlama', 'Danışmanlık']
  },

  // Hizmetler alt kategorileri
  'Temizlik': {
    title: 'Ev Temizlik Hizmeti',
    description: 'Haftalık ev temizlik hizmeti. Güvenilir personel.',
    price: 150,
    features: ['Haftalık hizmet', 'Güvenilir personel', 'Sigortalı']
  },
  'Nakliyat': {
    title: 'Evden Eve Nakliyat',
    description: 'Güvenli evden eve nakliyat hizmeti.',
    price: 800,
    features: ['Sigortalı taşıma', 'Paketleme hizmeti', 'Montaj']
  },
  'Teknik Servis': {
    title: 'Bilgisayar Teknik Servis',
    description: 'Bilgisayar ve laptop teknik servis hizmeti.',
    price: 100,
    features: ['Yerinde servis', 'Garantili', 'Hızlı çözüm']
  },

  // Elektronik alt kategorileri
  'Telefon': {
    title: 'Samsung Galaxy S23',
    description: 'Az kullanılmış Samsung Galaxy S23. Garantisi devam ediyor.',
    price: 18000,
    features: ['128GB', 'Garantili', 'Kutusu ile']
  },
  'Bilgisayar': {
    title: 'Gaming Laptop',
    description: 'Yüksek performanslı gaming laptop.',
    price: 35000,
    features: ['RTX 4060', '16GB RAM', '512GB SSD']
  },
  'Televizyon': {
    title: 'Smart TV 55"',
    description: '4K Smart TV. Netflix ve diğer uygulamalar dahil.',
    price: 12000,
    features: ['4K UHD', 'Smart TV', '55 inç']
  },

  // Ev & Bahçe alt kategorileri
  'Mobilya': {
    title: 'Yatak Odası Takımı',
    description: 'Modern yatak odası takımı. Gardrop, yatak ve komodin.',
    price: 5000,
    features: ['Modern tasarım', 'Kaliteli malzeme', 'Montaj dahil']
  },
  'Bahçe': {
    title: 'Bahçe Dekorasyon Seti',
    description: 'Bahçe için dekorasyon seti. Çiçek saksıları ve heykeller.',
    price: 300,
    features: ['Çiçek saksıları', 'Bahçe heykelleri', 'Dekoratif']
  },
  'Ev Aletleri': {
    title: 'Çamaşır Makinesi',
    description: '9 kg çamaşır makinesi. Enerji tasarruflu.',
    price: 4000,
    features: ['9 kg kapasite', 'A+ enerji', 'Garantili']
  },

  // Giyim alt kategorileri
  'Kadın Giyim': {
    title: 'Kadın Elbise',
    description: 'Şık kadın elbise. Özel günler için uygun.',
    price: 400,
    features: ['Şık tasarım', 'Kaliteli kumaş', 'Özel günler']
  },
  'Erkek Giyim': {
    title: 'Erkek Takım Elbise',
    description: 'Profesyonel erkek takım elbise.',
    price: 1200,
    features: ['Profesyonel', 'Kaliteli kumaş', 'Ölçüye göre']
  },
  'Ayakkabı': {
    title: 'Spor Ayakkabı',
    description: 'Rahat spor ayakkabı. Günlük kullanım için.',
    price: 250,
    features: ['Rahat', 'Günlük kullanım', 'Çeşitli renkler']
  },

  // Eğitim & Kurslar alt kategorileri
  'Yabancı Dil': {
    title: 'İngilizce Kursu',
    description: 'Online İngilizce kursu. Her seviye için.',
    price: 300,
    features: ['Online kurs', 'Her seviye', 'Sertifika']
  },
  'Müzik': {
    title: 'Gitar Dersi',
    description: 'Özel gitar dersi. Başlangıç seviyesi.',
    price: 150,
    features: ['Özel ders', 'Başlangıç seviyesi', 'Esnek saat']
  },
  'Spor': {
    title: 'Fitness Koçluğu',
    description: 'Kişisel fitness koçluğu. Evde veya spor salonunda.',
    price: 200,
    features: ['Kişisel koçluk', 'Evde veya salonda', 'Program hazırlama']
  }
};

async function createSubcategoryListings() {
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

    for (const [subcategory, example] of Object.entries(subcategoryExamples)) {
      // Bu alt kategoride zaten ilan var mı kontrol et
      const existingListing = await prisma.listing.findFirst({
        where: {
          subCategory: subcategory
        }
      });

      if (!existingListing) {
        // Ana kategoriyi belirle
        let mainCategory = 'Diğer';
        if (['Grafik Tasarım', 'Web Tasarım', 'Muhasebe'].includes(subcategory)) {
          mainCategory = 'İş';
        } else if (['Temizlik', 'Nakliyat', 'Teknik Servis'].includes(subcategory)) {
          mainCategory = 'Hizmetler';
        } else if (['Telefon', 'Bilgisayar', 'Televizyon'].includes(subcategory)) {
          mainCategory = 'Elektronik';
        } else if (['Mobilya', 'Bahçe', 'Ev Aletleri'].includes(subcategory)) {
          mainCategory = 'Ev & Bahçe';
        } else if (['Kadın Giyim', 'Erkek Giyim', 'Ayakkabı'].includes(subcategory)) {
          mainCategory = 'Giyim';
        } else if (['Yabancı Dil', 'Müzik', 'Spor'].includes(subcategory)) {
          mainCategory = 'Eğitim & Kurslar';
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

    console.log('Alt kategori ilanları oluşturma tamamlandı!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSubcategoryListings(); 