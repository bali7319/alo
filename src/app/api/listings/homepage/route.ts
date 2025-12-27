import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Ana sayfa için optimize edilmiş API route
// Premium ve latest listings'i birlikte döndürür
export async function GET() {
  try {
    // Premium ve latest listings'i paralel olarak çek
    const [premiumListings, latestListings] = await Promise.all([
      // Premium ilanları çek
      prisma.listing.findMany({
        where: {
          isPremium: true,
          isActive: true,
          approvalStatus: 'approved',
          expiresAt: {
            gt: new Date() // Süresi dolmamış ilanlar
          }
        },
        select: {
          id: true,
          title: true,
          price: true,
          location: true,
          category: true,
          subCategory: true, // Component'lerde kullanılıyor
          // description: true, // Ana sayfada gerekli değil - çok yer kaplar
          // images: true, // Base64 resimler çok büyük - ana sayfa için gerekli değil
          createdAt: true,
          isPremium: true,
          // premiumUntil: true, // Ana sayfada gerekli değil
          user: {
            select: {
              id: true,
              name: true,
              // email: true, // Ana sayfada gerekli değil
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      // En yeni ilanları çek
      prisma.listing.findMany({
        where: {
          isActive: true,
          approvalStatus: 'approved',
          expiresAt: {
            gt: new Date() // Süresi dolmamış ilanlar
          }
        },
        select: {
          id: true,
          title: true,
          price: true,
          location: true,
          category: true,
          subCategory: true, // Component'lerde kullanılıyor
          // description: true, // Ana sayfada gerekli değil - çok yer kaplar
          // images: true, // Base64 resimler çok büyük - ana sayfa için gerekli değil
          createdAt: true,
          isPremium: true,
          // premiumUntil: true, // Ana sayfada gerekli değil
          user: {
            select: {
              id: true,
              name: true,
              // email: true, // Ana sayfada gerekli değil
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
    ]);

    // Format listings - sadece gerekli alanlar (ana sayfa için minimal data)
    const formatListing = (listing: any) => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      location: listing.location,
      category: listing.category,
      subCategory: listing.subCategory || undefined, // Component'lerde kullanılıyor
      // description, images, premiumUntil, email kaldırıldı - ana sayfada gerekli değil
      createdAt: listing.createdAt.toISOString(),
      isPremium: listing.isPremium,
      user: {
        id: listing.user.id,
        name: listing.user.name || undefined,
      },
    });

    const featuredListings = premiumListings.map(formatListing);
    const latest = latestListings.map(formatListing);

    return NextResponse.json(
      {
        featuredListings,
        latestListings: latest,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Homepage listings fetch error:', error);
    return NextResponse.json(
      {
        featuredListings: [],
        latestListings: [],
        error: 'İlanlar yüklenirken hata oluştu',
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}

