// Mevcut base64 resimleri optimize et
// Kullanım: node scripts/optimize-existing-images.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Base64 resmi optimize et (basit versiyon - sadece boyut kontrolü)
function optimizeBase64Image(base64String, maxSizeKB = 500) {
  if (!base64String || !base64String.startsWith('data:image')) {
    return base64String; // Base64 değilse olduğu gibi döndür
  }

  // Base64 string'in boyutunu kontrol et (KB cinsinden)
  const sizeKB = (base64String.length * 3) / 4 / 1024;

  // Eğer boyut limitin altındaysa, olduğu gibi döndür
  if (sizeKB <= maxSizeKB) {
    return base64String;
  }

  // Çok büyükse, uyarı ver ama değiştirme (client-side optimizasyon gerekli)
  console.warn(`⚠️  Resim çok büyük: ${sizeKB.toFixed(2)} KB (limit: ${maxSizeKB} KB)`);
  return base64String; // Şimdilik olduğu gibi bırak
}

async function optimizeExistingImages() {
  try {
    console.log('🔍 Mevcut ilanlar kontrol ediliyor...\n');

    // Tüm aktif ilanları getir
    const listings = await prisma.listing.findMany({
      where: {
        isActive: true,
        approvalStatus: 'approved',
      },
      select: {
        id: true,
        title: true,
        images: true,
      },
    });

    console.log(`📊 Toplam ${listings.length} aktif ilan bulundu.\n`);

    let optimizedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const listing of listings) {
      try {
        // Images'ı parse et
        let images = [];
        try {
          if (typeof listing.images === 'string') {
            images = JSON.parse(listing.images);
          } else if (Array.isArray(listing.images)) {
            images = listing.images;
          }
        } catch {
          images = [];
        }

        if (images.length === 0) {
          skippedCount++;
          continue;
        }

        // Her resmi kontrol et
        let hasLargeImages = false;
        const optimizedImages = images.map(img => {
          if (typeof img === 'string' && img.startsWith('data:image')) {
            const sizeKB = (img.length * 3) / 4 / 1024;
            if (sizeKB > 500) {
              hasLargeImages = true;
              console.log(`⚠️  İlan "${listing.title}" - Resim boyutu: ${sizeKB.toFixed(2)} KB`);
            }
          }
          return img; // Şimdilik optimize etmiyoruz (client-side gerekli)
        });

        // Eğer optimize edilmiş resimler varsa, güncelle
        // Şimdilik sadece log tutuyoruz
        if (hasLargeImages) {
          optimizedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ İlan ${listing.id} işlenirken hata:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Özet:`);
    console.log(`   - Toplam ilan: ${listings.length}`);
    console.log(`   - Büyük resimli ilanlar: ${optimizedCount}`);
    console.log(`   - Normal ilanlar: ${skippedCount}`);
    console.log(`   - Hata: ${errorCount}`);

    console.log(`\n⚠️  Not: Bu script sadece kontrol ediyor.`);
    console.log(`   Resimleri optimize etmek için client-side optimizasyon gerekli.`);
    console.log(`   Yeni yüklenen resimler otomatik optimize edilecek.`);

  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

optimizeExistingImages();

