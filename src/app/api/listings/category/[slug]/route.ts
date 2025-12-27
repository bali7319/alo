import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Cache kaldırıldı - "Single item size exceeds maxSize" hatasını önlemek için
// export const revalidate = 60; // Büyük response'lar için cache kullanmayın

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const subSlug = searchParams.get('subSlug');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Kategori slug'ını kategori adına çevir
    const categoryMap: { [key: string]: string } = {
      'is': 'İş',
      'hizmetler': 'Hizmetler',
      'elektronik': 'Elektronik',
      'ev-ve-bahce': 'Ev & Bahçe',
      'giyim': 'Giyim',
      'moda-stil': 'Moda & Stil',
      'sporlar-oyunlar-eglenceler': 'Sporlar, Oyunlar ve Eğlenceler',
      'anne-bebek': 'Anne & Bebek',
      'cocuk-dunyasi': 'Çocuk Dünyası',
      'egitim-kurslar': 'Eğitim & Kurslar',
      'yemek-icecek': 'Yemek & İçecek',
      'catering-ticaret': 'Catering & Ticaret',
      'turizm-konaklama': 'Turizm & Konaklama',
      'saglik-guzellik': 'Sağlık & Güzellik',
      'sanat-hobi': 'Sanat & Hobi',
      'ucretsiz-gel-al': 'Ücretsiz Gel Al'
    };

    const categoryName = categoryMap[slug];
    
    // Kategori filtresi - hem slug hem de kategori adı ile arama yap
    const categoryFilter = categoryName 
      ? {
          OR: [
            { category: categoryName }, // Tam kategori adı formatında (örn: "Elektronik")
            { category: slug }, // Slug formatında (örn: "elektronik")
          ]
        }
      : { category: slug }; // Eğer kategori map'te yoksa, slug ile direkt arama yap

    let whereClause: any = {
      ...categoryFilter,
      isActive: true,
      approvalStatus: 'approved',
      expiresAt: {
        gt: new Date() // Süresi dolmamış ilanlar
      }
    };

    // Alt kategori varsa ekle
    if (subSlug) {
      const subCategoryMap: { [key: string]: string } = {
        'guvenlik': 'Güvenlik',
        'nakliyat': 'Nakliyat',
        'tasarim': 'Tasarım',
        'teknik-servis': 'Teknik Servis',
        'temizlik': 'Temizlik',
        'bilgisayar': 'Bilgisayar',
        'kamera': 'Kamera',
        'kulaklik': 'Kulaklık',
        'network': 'Network',
        'oyun-konsolu': 'Oyun Konsolu',
        'tablet': 'Tablet',
        'telefon': 'Telefon',
        'televizyon': 'Televizyon',
        'yazici': 'Yazıcı',
        'aydinlatma': 'Aydınlatma',
        'bahce-aletleri': 'Bahçe Aletleri',
        'beyaz-esya': 'Beyaz Eşya',
        'dekorasyon': 'Dekorasyon',
        'isitma-sogutma': 'Isıtma/Soğutma',
        'mobilya': 'Mobilya',
        'mutfak-gerecleri': 'Mutfak Gereçleri',
        'aksesuar': 'Aksesuar',
        'ayakkabi': 'Ayakkabı',
        'ayakkabi-canta': 'Ayakkabı & Çanta',
        'bayan-giyim': 'Bayan Giyim',
        'cocuk-giyim': 'Çocuk Giyim',
        'erkek-giyim': 'Erkek Giyim',
        'kadin': 'Kadın',
        'kadin-giyim': 'Kadın Giyim',
        'cocuk': 'Çocuk',
        'erkek': 'Erkek'
      };

      const subCategoryName = subCategoryMap[subSlug];
      if (subCategoryName) {
        whereClause.subCategory = subCategoryName;
      }
    }

    // Pagination ve limit ekle - performans için kritik!
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          price: true,
          location: true,
          category: true,
          subCategory: true,
          description: true, // Kısaltmak için gerekli
          images: true,
          createdAt: true,
          condition: true,
          isPremium: true,
          premiumUntil: true,
          expiresAt: true,
          views: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [
          { isPremium: 'desc' }, // Premium ilanlar önce
          { createdAt: 'desc' }, // Sonra tarihe göre
        ],
        skip,
        take: limit,
      }),
      prisma.listing.count({ where: whereClause }),
    ]).catch((dbError) => {
      console.error('Database query error:', dbError);
      // Database bağlantı hatası kontrolü
      if (dbError.code === 'P1001' || dbError.message?.includes('connect')) {
        throw new Error('Veritabanı bağlantı hatası. Lütfen daha sonra tekrar deneyin.');
      }
      throw dbError;
    });

    // Güvenli JSON parse fonksiyonu
    const safeParseImages = (images: string | null): string[] => {
      if (!images) return [];
      try {
        if (typeof images === 'string') {
          if (images.startsWith('data:image')) {
            return [images];
          }
          const parsed = JSON.parse(images);
          return Array.isArray(parsed) ? parsed : [];
        }
        return Array.isArray(images) ? images : [];
      } catch {
        return [];
      }
    };

    // Description'ı kısalt (liste görünümü için)
    const formattedListings = listings.map(listing => {
      const parsedImages = safeParseImages(listing.images);
      // Sadece ilk resmi gönder (performans için)
      const firstImage = parsedImages.length > 0 ? [parsedImages[0]] : [];

      return {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        location: listing.location,
        category: listing.category,
        subCategory: listing.subCategory,
        description: listing.description?.substring(0, 200) + (listing.description?.length > 200 ? '...' : ''),
        images: firstImage, // İlk resmi gönder
        createdAt: listing.createdAt.toISOString(),
        condition: listing.condition,
        isPremium: listing.isPremium,
        premiumUntil: listing.premiumUntil?.toISOString(),
        expiresAt: listing.expiresAt.toISOString(),
        views: listing.views,
        user: listing.user,
      };
    });

    return NextResponse.json(
      { 
        listings: formattedListings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate', // Büyük response'lar için cache yok
        }
      }
    );
  } catch (error) {
    console.error('Kategori ilanları getirme hatası:', error);
    
    // Hata tipine göre uygun HTTP status kodu döndür
    const errorMessage = error instanceof Error ? error.message : 'İlanlar yüklenirken hata oluştu';
    const statusCode = errorMessage.includes('bağlantı') ? 503 : 500;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        // Production'da detaylı hata mesajı gösterme
        ...(process.env.NODE_ENV === 'development' && { 
          details: error instanceof Error ? error.stack : undefined 
        })
      },
      { 
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      }
    );
  }
  // NOT: $disconnect() çağrısı yok - Prisma connection pool otomatik yönetir
} 