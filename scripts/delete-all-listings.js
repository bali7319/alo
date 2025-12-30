const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAllListings() {
  try {
    console.log('⚠️  TÜM İLANLAR SİLİNECEK!');
    console.log('İlişkili kayıtlar da temizlenecek...\n');

    // 1. İlişkili kayıtları temizle
    console.log('🧹 İlişkili kayıtlar temizleniyor...');
    
    // Favorilerden kaldır
    const favoritesDeleted = await prisma.userFavorite.deleteMany({});
    console.log(`   ✓ ${favoritesDeleted.count} favori kaydı silindi`);

    // Mesajlardan listingId'yi null yap
    const messagesUpdated = await prisma.message.updateMany({
      where: {
        listingId: { not: null }
      },
      data: {
        listingId: null,
      },
    });
    console.log(`   ✓ ${messagesUpdated.count} mesaj kaydı güncellendi`);

    // Şikayetleri sil
    const reportsDeleted = await prisma.report.deleteMany({});
    console.log(`   ✓ ${reportsDeleted.count} şikayet kaydı silindi`);

    // 2. Tüm ilanları sil
    console.log('\n🗑️  Tüm ilanlar siliniyor...');
    const result = await prisma.listing.deleteMany({});

    console.log(`\n✅ ${result.count} ilan başarıyla silindi!`);
    console.log('\n✅ Tüm ilanlar ve ilişkili kayıtlar temizlendi.');
  } catch (error) {
    console.error('\n❌ Hata:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllListings();

