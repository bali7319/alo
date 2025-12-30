import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCategoryNameBySlug, getSubCategoryNameBySlug } from '@/lib/category-mappings';
import type { ListingWhereInput, ListingResponse, CategoryListingsResponse } from '@/types/api';
import { categoryQuerySchema } from '@/lib/validations/category';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { getCache, setCache, createCacheKey } from '@/lib/cache';
import { 
  createBaseListingWhereClause, 
  createCategoryFilter, 
  safeParseImages, 
  truncateDescription 
} from '@/services/listing-service';

// Cache kaldırıldı - "Single item size exceeds maxSize" hatasını önlemek için
// export const revalidate = 60; // Büyük response'lar için cache kullanmayın

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Rate limiting - IP bazlı (100 istek/dakika)
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`category:${clientIP}`, 100, 60000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          }
        }
      );
    }
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    
    // Input validation - Zod ile
    const validationResult = categoryQuerySchema.safeParse({
      slug,
      subSlug: searchParams.get('subSlug'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Geçersiz parametreler', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { page, limit, subSlug } = validationResult.data;
    const skip = (page - 1) * limit;

    // Cache key oluştur (selective caching - sadece ilk sayfa için)
    const cacheKey = createCacheKey('category-listings', slug, subSlug || '', page, limit);
    
    // İlk sayfa için cache kontrolü (büyük response'lar için cache yok)
    // Sadece küçük sayfalarda cache kullan (performans için)
    if (page === 1 && limit <= 20) {
      const cached = getCache<CategoryListingsResponse>(cacheKey);
      if (cached) {
        return NextResponse.json(cached, {
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          }
        });
      }
    }

    // Kategori slug'ını kategori adına çevir (merkezi mapping kullan)
    const categoryName = getCategoryNameBySlug(slug);
    
    // Kategori filtresi oluştur
    const categoryFilter = createCategoryFilter(slug, categoryName);
    
    // Alt kategori filtresi ekle
    const additionalFilters: ListingWhereInput = { ...categoryFilter };
    if (subSlug) {
      const subCategoryName = getSubCategoryNameBySlug(subSlug);
      if (subCategoryName) {
        additionalFilters.subCategory = subCategoryName;
      }
    }

    // Base where clause oluştur (admin hariç, aktif, onaylı, süresi dolmamış)
    const whereClause = await createBaseListingWhereClause(additionalFilters);

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

    // Listing'leri formatla (service layer kullan)
    const formattedListings: ListingResponse[] = listings.map(listing => {
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
        description: truncateDescription(listing.description),
        images: firstImage, // İlk resmi gönder
        createdAt: listing.createdAt.toISOString(),
        condition: listing.condition,
        isPremium: listing.isPremium,
        premiumUntil: listing.premiumUntil?.toISOString() || null,
        expiresAt: listing.expiresAt.toISOString(),
        views: listing.views,
        user: {
          id: listing.user.id,
          name: listing.user.name,
          email: listing.user.email,
        },
      };
    });

    const response: CategoryListingsResponse = {
      listings: formattedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };

    // İlk sayfa için cache'e kaydet (30 saniye TTL)
    if (page === 1 && limit <= 20) {
      setCache(cacheKey, response, 30000);
    }

    return NextResponse.json(response,
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': page === 1 && limit <= 20 
            ? 'public, s-maxage=30, stale-while-revalidate=60' 
            : 'no-store, no-cache, must-revalidate',
          'X-Cache': 'MISS',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString(),
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