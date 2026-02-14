import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { handleApiError } from '@/lib/api-error';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const adminError = await requireAdmin(session);
    if (adminError) return adminError;

    // Tüm istatistikleri ve son aktiviteleri paralel getir
    const [
      totalUsers,
      totalListings,
      activeListings,
      pendingListings,
      rejectedListings,
      premiumListings,
      totalViews,
      totalMessages,
      latestUser,
      latestListing
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
      prisma.message.count(),
      prisma.user.findFirst({
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { name: true, createdAt: true }
      }),
      prisma.listing.findFirst({
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { title: true, createdAt: true }
      })
    ]);

    return NextResponse.json({
      totalUsers,
      totalListings,
      activeListings,
      pendingListings,
      rejectedListings,
      premiumListings,
      totalViews,
      totalMessages,
      latestUser,
      latestListing
    });
  } catch (error) {
    return handleApiError(error);
  }
}

