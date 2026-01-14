const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkListings() {
  try {
    const now = new Date();
    const total = await prisma.listing.count({
      where: {
        isActive: true,
        approvalStatus: 'approved',
        expiresAt: { gt: now }
      }
    });

    const premium = await prisma.listing.count({
      where: {
        isActive: true,
        approvalStatus: 'approved',
        expiresAt: { gt: now },
        OR: [{ isPremium: true }, { premiumUntil: { gt: now } }]
      }
    });

    console.log('✅ Toplam aktif ilan:', total);
    console.log('✅ Premium ilan (isPremium=true veya premiumUntil>now):', premium);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Hata:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkListings();
