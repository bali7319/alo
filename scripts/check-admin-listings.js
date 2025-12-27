// Admin kullanıcısının ilanlarını kontrol et
// Kullanım: node scripts/check-admin-listings.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdminListings() {
  try {
    console.log('🔍 Admin kullanıcısının ilanları kontrol ediliyor...\n');

    // Admin kullanıcısını bul
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@alo17.tr' },
    });

    if (!adminUser) {
      console.log('❌ Admin kullanıcısı bulunamadı.');
      return;
    }

    console.log(`✅ Admin kullanıcısı bulundu: ${adminUser.email} (ID: ${adminUser.id})\n`);

    // Admin'in tüm ilanlarını bul
    const adminListings = await prisma.listing.findMany({
      where: { userId: adminUser.id },
      select: { 
        id: true, 
        title: true, 
        category: true,
        subCategory: true,
        createdAt: true,
        isActive: true,
        approvalStatus: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`📊 Admin kullanıcısına ait toplam ${adminListings.length} ilan bulundu.\n`);

    // "Örnek İlan" içeren ilanları filtrele
    const ornekIlanlar = adminListings.filter(l => 
      l.title.toLowerCase().includes('örnek') || 
      l.title.toLowerCase().includes('demo') ||
      l.title.toLowerCase().includes('test')
    );

    console.log(`📋 "Örnek İlan", "Demo" veya "Test" içeren ${ornekIlanlar.length} ilan bulundu:\n`);
    
    if (ornekIlanlar.length > 0) {
      ornekIlanlar.slice(0, 20).forEach(l => {
        console.log(`   - ${l.title} (${l.category}${l.subCategory ? '/' + l.subCategory : ''}) - ${l.isActive ? 'Aktif' : 'Pasif'} - ${l.approvalStatus}`);
      });
      if (ornekIlanlar.length > 20) {
        console.log(`   ... ve ${ornekIlanlar.length - 20} ilan daha`);
      }
    }

    console.log(`\n📊 Özet:`);
    console.log(`   - Toplam admin ilanları: ${adminListings.length}`);
    console.log(`   - Örnek/Demo/Test içeren: ${ornekIlanlar.length}`);
    console.log(`   - Diğer ilanlar: ${adminListings.length - ornekIlanlar.length}`);

  } catch (error) {
    console.error('\n❌ Hata:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminListings();

