import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Timeout wrapper - 10 saniye içinde cevap vermezse hata döndür
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}

// Kullanıcının favori ilanlarını getir
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor', listings: [] },
        { status: 401 }
      );
    }

    const user = await withTimeout(
      prisma.user.findUnique({
        where: { email: session.user.email },
      }),
      5000
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı', listings: [] },
        { status: 404 }
      );
    }

    const favorites = await withTimeout(
      prisma.userFavorite.findMany({
      where: { userId: user.id },
      include: {
        listing: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      }),
      8000
    );

    const listings = favorites.map(fav => ({
      id: fav.listing.id,
      title: fav.listing.title,
      price: fav.listing.price,
      location: fav.listing.location,
      category: fav.listing.category,
      subCategory: fav.listing.subCategory,
      description: fav.listing.description,
      images: fav.listing.images,
      createdAt: fav.listing.createdAt.toISOString(),
      condition: fav.listing.condition,
      isPremium: fav.listing.isPremium,
      premiumUntil: fav.listing.premiumUntil?.toISOString(),
      expiresAt: fav.listing.expiresAt.toISOString(),
      user: fav.listing.user,
    }));

    return NextResponse.json(
      { listings },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  } catch (error) {
    console.error('Favoriler getirme hatası:', error);
    
    // Timeout hatası
    if (error instanceof Error && error.message.includes('timeout')) {
      console.error('Request timeout:', error.message);
      return NextResponse.json(
        { error: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.', listings: [] },
        { status: 504 }
      );
    }
    
    // Prisma bağlantı hatası kontrolü
    if (error instanceof Error) {
      if (error.message.includes('P1001') || error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
        console.error('Veritabanı bağlantı hatası:', error.message);
        return NextResponse.json(
          { error: 'Veritabanı bağlantı hatası. Lütfen daha sonra tekrar deneyin.', listings: [] },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Favoriler yüklenirken hata oluştu', listings: [] },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}

// İlanı favorilere ekle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { listingId } = await request.json();

    if (!listingId) {
      return NextResponse.json(
        { error: 'İlan ID\'si gerekli' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // İlanın var olup olmadığını kontrol et
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    // Zaten favori mi kontrol et
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId: listingId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Bu ilan zaten favorilerinizde' },
        { status: 400 }
      );
    }

    // Favori ekle
    await prisma.userFavorite.create({
      data: {
        userId: user.id,
        listingId: listingId,
      },
    });

    return NextResponse.json({ 
      message: 'İlan favorilere eklendi',
      success: true 
    });
  } catch (error) {
    console.error('Favori ekleme hatası:', error);
    return NextResponse.json(
      { error: 'Favori eklenirken hata oluştu' },
      { status: 500 }
    );
  }
} 