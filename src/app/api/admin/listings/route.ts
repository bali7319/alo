import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAdminEmail, requireAdmin } from '@/lib/admin';
import { handleApiError } from '@/lib/api-error';

// Admin için ilanları getir (sayfalama ve filtreleme ile)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const adminError = await requireAdmin(session);
    if (adminError) return adminError;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // 'pending', 'approved', 'rejected', 'all'

    const skip = (page - 1) * limit;

    // Filtre oluştur
    const where: any = {};
    if (status && status !== 'all') {
      where.approvalStatus = status;
    }

    // Toplam kayıt sayısı ve ilanları paralel getir (performans için)
    // Sadece tabloda gösterilen alanları çek (description, images, features gibi büyük alanlar çekilmiyor)
    const [total, listings] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          // description: true, // Tabloda gösterilmiyor, kaldırıldı
          price: true,
          // category: true, // Tabloda gösterilmiyor, kaldırıldı
          // subCategory: true, // Tabloda gösterilmiyor, kaldırıldı
          // subSubCategory: true, // Tabloda gösterilmiyor, kaldırıldı
          // location: true, // Tabloda gösterilmiyor, kaldırıldı
          // phone: true, // Tabloda gösterilmiyor, kaldırıldı
          // showPhone: true, // Tabloda gösterilmiyor, kaldırıldı
          approvalStatus: true,
          isActive: true,
          isPremium: true,
          premiumUntil: true,
          expiresAt: true,
          // views: true, // Tabloda gösterilmiyor, kaldırıldı
          moderatorId: true,
          moderatedAt: true,
          // moderatorNotes: true, // Tabloda gösterilmiyor, kaldırıldı
          createdAt: true,
          // updatedAt: true, // Tabloda gösterilmiyor, kaldırıldı
          // images: true, // Tabloda gösterilmiyor, büyük alan - kaldırıldı
          // features: true, // Tabloda gösterilmiyor, büyük alan - kaldırıldı
          // premiumFeatures: true, // Tabloda gösterilmiyor, büyük alan - kaldırıldı
          // condition: true, // Tabloda gösterilmiyor, kaldırıldı
          // brand: true, // Tabloda gösterilmiyor, kaldırıldı
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
              role: true,
            },
          },
        },
      }),
    ]);

    // İlanları formatla - sadece tabloda gösterilen alanlar
    const formattedListings = listings.map(listing => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      isPremium: listing.isPremium,
      premiumUntil: listing.premiumUntil?.toISOString() || null,
      expiresAt: listing.expiresAt.toISOString(),
      isActive: listing.isActive,
      approvalStatus: listing.approvalStatus,
      moderatorId: listing.moderatorId,
      moderatedAt: listing.moderatedAt?.toISOString() || null,
      createdAt: listing.createdAt.toISOString(),
      user: listing.user,
      moderator: listing.moderator ? {
        id: listing.moderator.id,
        name: listing.moderator.name,
        email: listing.moderator.email,
        role: listing.moderator.role,
      } : null,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      listings: formattedListings,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

