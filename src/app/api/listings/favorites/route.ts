import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Kullanıcının favori ilanlarını getir
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
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

    const favorites = await prisma.userFavorite.findMany({
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
    });

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
      views: fav.listing.views,
      user: fav.listing.user,
    }));

    return NextResponse.json({ listings });
  } catch (error) {
    console.error('Favoriler getirme hatası:', error);
    return NextResponse.json(
      { error: 'Favoriler yüklenirken hata oluştu' },
      { status: 500 }
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