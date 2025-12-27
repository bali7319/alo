// "Örnek İlan" içeren TÜM ilanları sil (hangi kullanıcıya ait olursa olsun)
// Kullanım: node scripts/delete-all-ornek-ilanlar.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllOrnekIlanlar() {
  try {
    console.log('🔍 "Örnek İlan" içeren tüm ilanlar kontrol ediliyor...\n');

    // "Örnek İlan" içeren TÜM ilanları bul
    const ornekIlanlar = await prisma.listing.findMany({
      where: {
        OR: [
          { title: { contains: 'Örnek İlan', mode: 'insensitive' } },
          { title: { contains: 'örnek ilan', mode: 'insensitive' } },
          { title: { contains: 'Örnek', mode: 'insensitive' } },
          { title: { contains: 'örnek', mode: 'insensitive' } },
        ],
      },
      select: { id: true, title: true, category: true, user: { select: { email: true } } },
    });

    console.log(`📋 "Örnek İlan" içeren toplam ${ornekIlanlar.length} ilan bulundu:\n`);
    
    if (ornekIlanlar.length > 0) {
      ornekIlanlar.slice(0, 20).forEach(l => {
        console.log(`   - ${l.title} (${l.category}) - Kullanıcı: ${l.user?.email || 'Bilinmeyen'}`);
      });
      if (ornekIlanlar.length > 20) {
        console.log(`   ... ve ${ornekIlanlar.length - 20} ilan daha`);
      }
    }

    if (ornekIlanlar.length === 0) {
      console.log('\n✅ Silinecek "Örnek İlan" bulunamadı.');
      return;
    }

    const uniqueIds = Array.from(new Set(ornekIlanlar.map(l => l.id)));

    console.log(`\n📊 Toplam ${uniqueIds.length} benzersiz "Örnek İlan" silinecek.`);
    console.log(`\n⚠️  DİKKAT: Bu işlem geri alınamaz!`);
    console.log(`\nDevam etmek için 'EVET' yazın:`);

    // İnteraktif onay için readline kullan
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('', async (answer) => {
      if (answer.trim().toUpperCase() !== 'EVET') {
        console.log('\n❌ İşlem iptal edildi.');
        rl.close();
        await prisma.$disconnect();
        return;
      }

      try {
        // İlişkili kayıtları temizle
        console.log('\n🧹 İlişkili kayıtlar temizleniyor...');
        
        const favoritesDeleted = await prisma.userFavorite.deleteMany({
          where: { listingId: { in: uniqueIds } },
        });
        console.log(`   ✓ ${favoritesDeleted.count} favori kaydı silindi`);

        const messagesUpdated = await prisma.message.updateMany({
          where: { listingId: { in: uniqueIds } },
          data: { listingId: null },
        });
        console.log(`   ✓ ${messagesUpdated.count} mesaj kaydı güncellendi`);

        const reportsDeleted = await prisma.report.deleteMany({
          where: { listingId: { in: uniqueIds } },
        });
        console.log(`   ✓ ${reportsDeleted.count} şikayet kaydı silindi`);

        // İlanları sil
        console.log('\n🗑️  İlanlar siliniyor...');
        const result = await prisma.listing.deleteMany({
          where: { id: { in: uniqueIds } },
        });

        console.log(`\n✅ ${result.count} "Örnek İlan" başarıyla silindi!`);
        console.log(`\n📋 Silinen ilan ID'leri: ${uniqueIds.slice(0, 10).join(', ')}${uniqueIds.length > 10 ? '...' : ''}`);
      } catch (error) {
        console.error('\n❌ Hata:', error);
      } finally {
        rl.close();
        await prisma.$disconnect();
      }
    });
  } catch (error) {
    console.error('\n❌ Hata:', error);
    process.exit(1);
  }
}

deleteAllOrnekIlanlar();

