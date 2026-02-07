import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireModeratorOrAdmin } from '@/lib/admin';
import { handleApiError } from '@/lib/api-error';
import { Prisma } from '@prisma/client';

// Moderator için bekleyen ilanları getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const auth = await requireModeratorOrAdmin(session);
    if (auth instanceof NextResponse) return auth;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // 'pending', 'approved', 'rejected', 'all'

    const skip = (page - 1) * limit;

    // Filtre oluştur
    const where: Prisma.ListingWhereInput = {};
    if (status && status !== 'all') {
      where.approvalStatus = status;
    } else {
      // Varsayılan olarak bekleyen ilanları göster
      where.approvalStatus = 'pending';
    }

    // Toplam kayıt sayısı
    const total = await prisma.listing.count({ where });

    // İlanları getir (moderator bilgileri ile)
    const listings = await prisma.listing.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        moderator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const parseArray = (val: string | null) => {
      if (!val) return [];
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
        return parsed ? [parsed] : [];
      } catch {
        return typeof val === 'string' ? [val] : [];
      }
    };

    const formattedListings = listings.map(listing => {
      try {
        return {
          ...listing,
          images: parseArray(listing.images),
          features: parseArray(listing.features),
          premiumFeatures: listing.premiumFeatures ? JSON.parse(listing.premiumFeatures) : null,
          moderatedAt: listing.moderatedAt ? listing.moderatedAt.toISOString() : null,
          createdAt: listing.createdAt.toISOString(),
          updatedAt: listing.updatedAt.toISOString(),
          expiresAt: listing.expiresAt.toISOString(),
          premiumUntil: listing.premiumUntil ? listing.premiumUntil.toISOString() : null,
        };
      } catch (parseError) {
        console.error('Listing format hatası:', parseError);
        return {
          ...listing,
          images: [],
          features: [],
          premiumFeatures: null,
          moderatedAt: listing.moderatedAt ? listing.moderatedAt.toISOString() : null,
          createdAt: listing.createdAt.toISOString(),
          updatedAt: listing.updatedAt.toISOString(),
          expiresAt: listing.expiresAt.toISOString(),
          premiumUntil: listing.premiumUntil ? listing.premiumUntil.toISOString() : null,
        };
      }
    });

    return NextResponse.json({
      listings: formattedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

