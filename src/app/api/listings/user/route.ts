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

// Kullanıcının ilanlarını getir
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor', listings: [] },
        { status: 401 }
      );
    }

    // Kullanıcıyı bul (timeout ile)
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

    // Kullanıcının ilanlarını getir (aktif ve süresi dolmuş olanlar - 7 gün içinde)
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const listings = await withTimeout(
      prisma.listing.findMany({
      where: {
        userId: user.id,
        OR: [
          // Aktif ilanlar
          { isActive: true },
          // Süresi dolmuş ama 7 gün içinde olanlar (profilde gösterilebilir)
          {
            isActive: false,
            expiresAt: {
              gte: sevenDaysAgo
            }
          }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // PERFORMANS: Kullanıcı ilanları için limit
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        category: true,
        subCategory: true,
        subSubCategory: true,
        location: true,
        phone: true,
        showPhone: true,
        images: true,
        features: true,
        condition: true,
        brand: true,
        model: true,
        year: true,
        isPremium: true,
        premiumFeatures: true,
        premiumUntil: true,
        expiresAt: true,
        views: true,
        isActive: true,
        approvalStatus: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      }),
      8000
    );

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
        user: listing.user,
      };
    });

    return NextResponse.json(
      { listings: formattedListings },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  } catch (error) {
    console.error('Kullanıcı ilanları getirme hatası:', error);
    
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
      { error: 'İlanlar yüklenirken bir hata oluştu', listings: [] },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
  // NOT: $disconnect() çağrısını kaldırdık - Prisma connection pool otomatik yönetir
}

