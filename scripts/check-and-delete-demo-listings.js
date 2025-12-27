// Demo/Örnek İlanları Kontrol Et ve Sil
// Kullanım: node scripts/check-and-delete-demo-listings.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndDeleteDemoListings() {
  try {
    console.log('🔍 Demo/örnek ilanlar kontrol ediliyor...\n');

    // 1. Admin kullanıcısını bul (sadece hariç tutmak için)
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@alo17.tr' },
    });

    if (adminUser) {
      console.log(`ℹ️  Admin kullanıcısı bulundu. Admin'in ilanları korunacak.`);
    } else {
      console.log('⚠️  Admin kullanıcısı bulunamadı.');
    }

    // 2. Demo/örnek/test içeren başlıklara sahip ilanları bul
    // Admin kullanıcısının ilanlarını SİLMEYİZ
    const whereClause = {
      AND: [
        {
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
        // Admin kullanıcısının ilanlarını hariç tut
        ...(adminUser ? [{ userId: { not: adminUser.id } }] : []),
      ],
    };

    const demoListings = await prisma.listing.findMany({
      where: whereClause,
      select: { id: true, title: true, category: true },
    });

    console.log(`\n📋 Demo/örnek/test içeren ${demoListings.length} ilan bulundu (Admin ilanları hariç):`);
    demoListings.forEach(l => {
      console.log(`   - ${l.title} (${l.category})`);
    });

    // 3. Tekrarları kaldır
    const uniqueIds = Array.from(new Set(demoListings.map(l => l.id)));

    console.log(`\n📊 Toplam ${uniqueIds.length} benzersiz demo/örnek ilan bulundu.`);

    if (uniqueIds.length === 0) {
      console.log('\n✅ Silinecek demo/örnek ilan bulunamadı.');
      return;
    }

    // 4. İlişkili kayıtları temizle
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

    // 5. İlanları sil
    console.log('\n🗑️  İlanlar siliniyor...');
    const result = await prisma.listing.deleteMany({
      where: { id: { in: uniqueIds } },
    });

    console.log(`\n✅ ${result.count} demo/örnek ilan başarıyla silindi!`);
    console.log(`\n📋 Silinen ilan ID'leri: ${uniqueIds.join(', ')}`);

  } catch (error) {
    console.error('\n❌ Hata:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndDeleteDemoListings();

