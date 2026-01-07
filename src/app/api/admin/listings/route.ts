import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAdminEmail } from '@/lib/admin';

// Admin için ilanları getir (sayfalama ve filtreleme ile)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Admin kontrolü - session'dan role ile (daha hızlı)
    const userRole = (session.user as any)?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkiniz yok' },
        { status: 403 }
      );
    }

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
  } catch (error: unknown) {
    console.error('Admin ilanlar getirme hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('Hata detayı:', errorMessage);
    return NextResponse.json(
      { 
        error: 'İlanlar yüklenirken bir hata oluştu',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
  // NOT: $disconnect() çağrısını kaldırdık - Prisma connection pool otomatik yönetir
}

