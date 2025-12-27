// Admin kullanıcısının SADECE demo/örnek ilanlarını sil
// Kullanım: node scripts/delete-admin-demo-listings.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAdminDemoListings() {
  try {
    console.log('🔍 Admin kullanıcısının demo/örnek ilanları kontrol ediliyor...\n');

    // Admin kullanıcısını bul
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@alo17.tr' },
    });

    if (!adminUser) {
      console.log('❌ Admin kullanıcısı bulunamadı.');
      return;
    }

    // Admin'in SADECE demo/örnek/test içeren ilanlarını bul
    const demoListings = await prisma.listing.findMany({
      where: {
        userId: adminUser.id,
        OR: [
          { title: { contains: 'Demo', mode: 'insensitive' } },
          { title: { contains: 'Örnek', mode: 'insensitive' } },
          { title: { contains: 'Test', mode: 'insensitive' } },
          { title: { contains: 'örnek', mode: 'insensitive' } },
          { title: { contains: 'demo', mode: 'insensitive' } },
          { title: { contains: 'test', mode: 'insensitive' } },
          { brand: { contains: 'Demo', mode: 'insensitive' } },
          { brand: { contains: 'örnek', mode: 'insensitive' } },
          { model: { contains: 'Demo', mode: 'insensitive' } },
          { model: { contains: 'örnek', mode: 'insensitive' } },
        ],
      },
      select: { id: true, title: true, category: true },
    });

    console.log(`📋 Admin kullanıcısına ait ${demoListings.length} demo/örnek ilan bulundu:\n`);
    demoListings.slice(0, 20).forEach(l => {
      console.log(`   - ${l.title} (${l.category})`);
    });
    if (demoListings.length > 20) {
      console.log(`   ... ve ${demoListings.length - 20} ilan daha`);
    }

    if (demoListings.length === 0) {
      console.log('\n✅ Silinecek demo/örnek ilan bulunamadı.');
      return;
    }

    const uniqueIds = Array.from(new Set(demoListings.map(l => l.id)));

    console.log(`\n📊 Toplam ${uniqueIds.length} benzersiz demo/örnek ilan silinecek.`);
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

        console.log(`\n✅ ${result.count} demo/örnek ilan başarıyla silindi!`);
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

deleteAdminDemoListings();

