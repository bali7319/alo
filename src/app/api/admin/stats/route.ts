import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Admin kontrolü
    if (session.user.email !== 'admin@alo17.tr') {
      return NextResponse.json(
        { error: 'Yetkiniz yok' },
        { status: 403 }
      );
    }

    // Tüm istatistikleri paralel olarak getir
    const [
      totalUsers,
      totalListings,
      activeListings,
      pendingListings,
      rejectedListings,
      premiumListings,
      totalViews,
      totalMessages
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.listing.count({ where: { isActive: true, approvalStatus: 'approved' } }),
      prisma.listing.count({ where: { approvalStatus: 'pending' } }),
      prisma.listing.count({ where: { approvalStatus: 'rejected' } }),
      prisma.listing.count({ where: { isPremium: true } }),
      prisma.listing.aggregate({
        _sum: {
          views: true
        }
      }).then(result => result._sum.views || 0),
      prisma.message.count()
    ]);

    return NextResponse.json({
      totalUsers,
      totalListings,
      activeListings,
      pendingListings,
      rejectedListings,
      premiumListings,
      totalViews,
      totalMessages
    });
  } catch (error) {
    console.error('İstatistik getirme hatası:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'İstatistikler yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

