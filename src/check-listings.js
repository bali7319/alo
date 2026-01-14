const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkListings() {
  try {
    const total = await prisma.listing.count({
      where: {
        isActive: true,
        approvalStatus: 'approved',
        expiresAt: { gt: new Date() }
      }
    });

    const premium = await prisma.listing.count({
      where: {
        isPremium: true,
        isActive: true,
        approvalStatus: 'approved',
        expiresAt: { gt: new Date() }
      }
    });

    console.log('✅ Toplam aktif ilan:', total);
    console.log('✅ Premium ilan:', premium);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Hata:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkListings();
