import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Kullanıcının ilanlarını getir (my-listings endpoint)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcının ilanlarını getir
    const listings = await prisma.listing.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
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

      // Durum belirleme
      let status: 'active' | 'pending' | 'expired' = 'active';
      if (listing.approvalStatus === 'pending') {
        status = 'pending';
      } else if (listing.approvalStatus === 'rejected') {
        status = 'expired';
      } else if (new Date(listing.expiresAt) < new Date()) {
        status = 'expired';
      } else if (!listing.isActive) {
        status = 'expired';
      }

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
        model: listing.model,
        year: listing.year,
        isPremium: listing.isPremium,
        premiumFeatures,
        premiumUntil: listing.premiumUntil?.toISOString(),
        expiresAt: listing.expiresAt.toISOString(),
        views: listing.views,
        isActive: listing.isActive,
        approvalStatus: listing.approvalStatus,
        status,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({ listings: formattedListings });
  } catch (error) {
    console.error('Kullanıcı ilanları getirme hatası:', error);
    return NextResponse.json(
      { error: 'İlanlar yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
  // NOT: $disconnect() çağrısını kaldırdık - Prisma connection pool otomatik yönetir
}

