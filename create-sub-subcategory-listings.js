const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const subSubCategoryListings = [
  // Beyaz Eşya alt kategorileri
  {
    title: "Samsung Buzdolabı - 2 Yıl Garantili",
    description: "Samsung 450L buzdolabı, A+ enerji sınıfı, 2 yıl garantili, çok temiz durumda. Fiyatta pazarlık payı var.",
    price: 8500,
    category: "ev-ve-bahce",
    subcategory: "beyaz-esya",
    subSubcategory: "buzdolabi-dondurucu",
    condition: "USED",
    images: ["placeholder.jpg"],
    location: "İstanbul",
    phone: "5551234567",
    features: ["A+ Enerji Sınıfı", "450L Kapasite", "2 Yıl Garanti"]
  },
  {
    title: "Beko Çamaşır Makinesi - 8kg",
    description: "Beko 8kg çamaşır makinesi, 1000 devir, A+ enerji sınıfı, 1 yıl kullanıldı, çok iyi durumda.",
    price: 3200,
    category: "ev-ve-bahce",
    subcategory: "beyaz-esya",
    subSubcategory: "camasir-kurutma",
    condition: "USED",
    images: ["placeholder.jpg"],
    location: "Ankara",
    phone: "5551234568",
    features: ["8kg Kapasite", "1000 Devir", "A+ Enerji Sınıfı"]
  },
  {
    title: "Bosch Bulaşık Makinesi - 12 Kişilik",
    description: "Bosch 12 kişilik bulaşık makinesi, sessiz çalışma, A+ enerji sınıfı, 3 yıl garantili.",
    price: 4500,
    category: "ev-ve-bahce",
    subcategory: "beyaz-esya",
    subSubcategory: "bulasik-makinesi",
    condition: "NEW",
    images: ["placeholder.jpg"],
    location: "İzmir",
    phone: "5551234569",
    features: ["12 Kişilik", "Sessiz Çalışma", "A+ Enerji Sınıfı"]
  },
  {
    title: "Arçelik Fırın - 60cm",
    description: "Arçelik 60cm fırın, gazlı ocak, A+ enerji sınıfı, 1 yıl kullanıldı, temiz durumda.",
    price: 2800,
    category: "ev-ve-bahce",
    subcategory: "beyaz-esya",
    subSubcategory: "firin-ocak",
    condition: "USED",
    images: ["placeholder.jpg"],
    location: "Bursa",
    phone: "5551234570",
    features: ["60cm", "Gazlı Ocak", "A+ Enerji Sınıfı"]
  },
  {
    title: "LG Mikrodalga Fırın - 25L",
    description: "LG 25L mikrodalga fırın, inverter teknolojisi, A+ enerji sınıfı, 6 ay kullanıldı.",
    price: 1200,
    category: "ev-ve-bahce",
    subcategory: "beyaz-esya",
    subSubcategory: "mikrodalga",
    condition: "USED",
    images: ["placeholder.jpg"],
    location: "Antalya",
    phone: "5551234571",
    features: ["25L Kapasite", "Inverter Teknolojisi", "A+ Enerji Sınıfı"]
  },
  {
    title: "Vestel Klima - 12000 BTU",
    description: "Vestel 12000 BTU klima, inverter, A+ enerji sınıfı, 2 yıl garantili, montaj dahil.",
    price: 3800,
    category: "ev-ve-bahce",
    subcategory: "isitma-sogutma",
    subSubcategory: "klima-isitici",
    condition: "NEW",
    images: ["placeholder.jpg"],
    location: "İstanbul",
    phone: "5551234572",
    features: ["12000 BTU", "Inverter", "A+ Enerji Sınıfı", "Montaj Dahil"]
  },
  {
    title: "Mitsubishi Klima - 18000 BTU",
    description: "Mitsubishi 18000 BTU klima, inverter, A+ enerji sınıfı, 3 yıl kullanıldı, çok iyi durumda.",
    price: 4200,
    category: "ev-ve-bahce",
    subcategory: "isitma-sogutma",
    subSubcategory: "klima-isitici",
    condition: "USED",
    images: ["placeholder.jpg"],
    location: "Ankara",
    phone: "5551234573",
    features: ["18000 BTU", "Inverter", "A+ Enerji Sınıfı"]
  },
  {
    title: "Endüstriyel Soğutma Sistemi",
    description: "Endüstriyel soğutma sistemi, 5 yıl kullanıldı, restoran için uygun, bakımı yapıldı.",
    price: 15000,
    category: "ev-ve-bahce",
    subcategory: "isitma-sogutma",
    subSubcategory: "sogutma-sistemleri",
    condition: "USED",
    images: ["placeholder.jpg"],
    location: "İzmir",
    phone: "5551234574",
    features: ["Endüstriyel", "Restoran Uyumlu", "Bakım Yapıldı"]
  },
  {
    title: "Vitrin Soğutucu - 2 Kapılı",
    description: "2 kapılı vitrin soğutucu, market için uygun, 3 yıl kullanıldı, çalışır durumda.",
    price: 8500,
    category: "ev-ve-bahce",
    subcategory: "isitma-sogutma",
    subSubcategory: "sogutma-sistemleri",
    condition: "USED",
    images: ["placeholder.jpg"],
    location: "Bursa",
    phone: "5551234575",
    features: ["2 Kapılı", "Market Uyumlu", "Çalışır Durumda"]
  }
];

async function createSubSubCategoryListings() {
  try {
    console.log('Alt-alt kategori ilanları oluşturuluyor...');
    const expiresAt = new Date(Date.now() + 40 * 24 * 60 * 60 * 1000); // 40 gün sonrası
    for (const listing of subSubCategoryListings) {
      const createdListing = await prisma.listing.create({
        data: {
          title: listing.title,
          description: listing.description,
          price: listing.price,
          category: listing.category,
          subCategory: listing.subcategory,
          subSubCategory: listing.subSubcategory,
          condition: listing.condition,
          images: JSON.stringify(listing.images),
          location: listing.location,
          phone: listing.phone,
          features: JSON.stringify(listing.features),
          approvalStatus: 'APPROVED',
          userId: 'cmc3iipnt0001qjy49f3b1ugx', // Test kullanıcısı
          expiresAt
        }
      });
      
      console.log(`İlan oluşturuldu: ${createdListing.title}`);
    }
    
    console.log('Tüm alt-alt kategori ilanları başarıyla oluşturuldu!');
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSubSubCategoryListings(); 