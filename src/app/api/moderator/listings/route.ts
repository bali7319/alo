import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Moderator için bekleyen ilanları getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Admin veya moderator kontrolü
    const user = await (prisma.user.findUnique as any)({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user || ((user as any).role !== 'admin' && (user as any).role !== 'moderator')) {
      return NextResponse.json(
        { error: 'Yetkiniz yok. Sadece admin ve moderatörler bu sayfaya erişebilir.' },
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // 'pending', 'approved', 'rejected', 'all'

    const skip = (page - 1) * limit;

    // Filtre oluştur
    const where: any = {};
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
    }).catch((error) => {
      console.error('Prisma query hatası:', error);
      throw error;
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
    console.error('Moderator ilan getirme hatası:', error);
    
    // Error object'i güvenli şekilde serialize et
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    const errorName = error instanceof Error ? error.name : 'Error';
    
    return NextResponse.json(
      { 
        error: 'İlanlar yüklenirken hata oluştu',
        message: errorMessage,
        type: errorName
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
  // NOT: $disconnect() çağrısını kaldırdık
  // Prisma connection pool otomatik yönetir, manuel disconnect connection pool'u bozar
}

