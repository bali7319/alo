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

    // Admin kontrolü
    const adminEmail = getAdminEmail();
    if (session.user.email !== adminEmail) {
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
            role: true,
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

    const parseJson = (val: string | null) => {
      if (!val) return null;
      try {
        return JSON.parse(val);
      } catch {
        return null;
      }
    };

    // İlanları formatla
    const formattedListings = listings.map(listing => {
      const images = parseArray(listing.images);
      const features = parseArray(listing.features);
      const premiumFeatures = parseJson(listing.premiumFeatures);

      return {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        subCategory: listing.subCategory,
        subSubCategory: listing.subSubCategory,
        location: listing.location,
        phone: listing.phone,
        showPhone: listing.showPhone,
        images,
        features,
        condition: listing.condition,
        brand: listing.brand,
        isPremium: listing.isPremium,
        premiumFeatures,
        premiumUntil: listing.premiumUntil?.toISOString(),
        expiresAt: listing.expiresAt.toISOString(),
        views: listing.views,
        isActive: listing.isActive,
        approvalStatus: listing.approvalStatus,
        moderatorId: listing.moderatorId,
        moderatedAt: listing.moderatedAt?.toISOString(),
        moderatorNotes: listing.moderatorNotes,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
        user: listing.user,
        moderator: listing.moderator ? {
          id: listing.moderator.id,
          name: listing.moderator.name,
          email: listing.moderator.email,
          role: listing.moderator.role,
        } : null,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      listings: formattedListings,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error: any) {
    console.error('Admin ilanlar getirme hatası:', error);
    console.error('Hata detayı:', error.message);
    return NextResponse.json(
      { 
        error: 'İlanlar yüklenirken bir hata oluştu',
        details: error.message 
      },
      { status: 500 }
    );
  }
  // NOT: $disconnect() çağrısını kaldırdık - Prisma connection pool otomatik yönetir
}

