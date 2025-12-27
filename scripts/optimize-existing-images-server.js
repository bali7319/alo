// Mevcut base64 resimleri server-side optimize et
// Kullanım: node scripts/optimize-existing-images-server.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Base64 resmi optimize et (basit versiyon - sadece boyut kontrolü ve uyarı)
// Not: Gerçek optimizasyon için sharp veya jimp kütüphanesi gerekli
async function optimizeBase64Image(base64String, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
  if (!base64String || !base64String.startsWith('data:image')) {
    return { optimized: false, original: base64String, reason: 'Base64 değil' };
  }

  // Base64 string'in boyutunu kontrol et (KB cinsinden)
  const sizeKB = (base64String.length * 3) / 4 / 1024;

  // Eğer boyut küçükse (500KB altı), optimize etmeye gerek yok
  if (sizeKB <= 500) {
    return { optimized: false, original: base64String, reason: 'Zaten küçük', sizeKB };
  }

  // Çok büyükse uyarı ver
  console.warn(`⚠️  Resim çok büyük: ${sizeKB.toFixed(2)} KB`);
  
  // Şimdilik olduğu gibi döndür (gerçek optimizasyon için sharp/jimp gerekli)
  return { 
    optimized: false, 
    original: base64String, 
    reason: 'Optimizasyon için sharp/jimp gerekli',
    sizeKB 
  };
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

    let largeImageCount = 0;
    let totalSizeKB = 0;
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
        let listingTotalSize = 0;

        for (const img of images) {
          if (typeof img === 'string' && img.startsWith('data:image')) {
            const sizeKB = (img.length * 3) / 4 / 1024;
            listingTotalSize += sizeKB;
            
            if (sizeKB > 500) {
              hasLargeImages = true;
              largeImageCount++;
            }
          }
        }

        if (hasLargeImages) {
          console.log(`⚠️  "${listing.title.substring(0, 50)}..." - Toplam: ${listingTotalSize.toFixed(2)} KB`);
          totalSizeKB += listingTotalSize;
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
    console.log(`   - Büyük resim sayısı: ${largeImageCount}`);
    console.log(`   - Toplam resim boyutu: ${(totalSizeKB / 1024).toFixed(2)} MB`);
    console.log(`   - Normal ilanlar: ${skippedCount}`);
    console.log(`   - Hata: ${errorCount}`);

    if (largeImageCount > 0) {
      console.log(`\n💡 Optimizasyon Potansiyeli:`);
      console.log(`   - ${largeImageCount} resim optimize edilebilir`);
      console.log(`   - Tahmini boyut azalması: %50-70`);
      console.log(`   - Tahmini hız artışı: %30-50`);
    }

    console.log(`\n⚠️  Not: Bu script sadece analiz yapıyor.`);
    console.log(`   Gerçek optimizasyon için sharp veya jimp kütüphanesi gerekli.`);
    console.log(`   Yeni yüklenen resimler otomatik optimize edilecek.`);

  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

optimizeExistingImages();

