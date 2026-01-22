import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSlug, extractIdFromSlug } from '@/lib/slug';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { updateListingSchema } from '@/lib/validations/listing';
import { getCache, setCache, deleteCache, clearCachePattern, createCacheKey } from '@/lib/cache';
import { decryptPhone } from '@/lib/encryption';

// Timeout wrapper - 8 saniye içinde cevap vermezse hata döndür
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: slugOrId } = await params;
    console.log(`[GET /api/listings/${slugOrId}] İstek alındı`);

    if (!slugOrId) {
      return NextResponse.json(
        { error: 'İlan slug veya ID gerekli' },
        { status: 400 }
      );
    }

    // Oturum bilgisi (views görünürlüğü ve owner kontrolü için)
    const session = await getServerSession(authOptions);

    // Slug'dan ID çıkarmayı dene
    const possibleId = extractIdFromSlug(slugOrId);
    
    let listing;
    if (possibleId) {
      // Eski ID formatı - direkt ID ile ara
      // İlan detay sayfasında admin ilanlarını da göster (direkt linke tıklanmışsa)
      listing = await withTimeout(
        prisma.listing.findUnique({
          where: { id: possibleId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                location: true,
              },
            },
          },
        }),
        5000 // 5 saniye timeout
      );
      
      // İlan bulunduysa ama aktif değilse veya onaylanmamışsa kontrol et
      if (listing && (!listing.isActive || listing.approvalStatus !== 'approved')) {
        // Admin ilanı olabilir, yine de göster
        // Ama normal kullanıcı ilanları için aktif ve onaylı olmalı
        const { getAdminEmail } = await import('@/lib/admin');
        const adminEmail = getAdminEmail();
        
        // İlan sahibi kontrolü - pending durumundaki ilanlar sahibi tarafından görülebilir
        const isOwner = session?.user?.email && listing.user.email === session.user.email;
        
        if (listing.user.email !== adminEmail && !isOwner) {
          // Normal kullanıcı ilanı ama aktif değil ve sahibi değil - gösterme
          listing = null;
        }
        // Admin ilanı veya sahibi ise göster (aktif olmasa bile)
      }
    } else {
      // Slug formatı - Daha esnek arama: En az bir kelime eşleşsin, sonra slug ile tam eşleşen ilanı bul
      const keywords = slugOrId
        .split('-')
        .filter(word => word.length > 1) // 1 karakterden uzun kelimeleri al (daha esnek)
        .slice(0, 10); // İlk 10 kelimeyi al (uzun başlıklar için)
      
      // İlan detay sayfasında admin ilanlarını da dahil et (direkt linke tıklanmışsa)
      const { getAdminEmail } = await import('@/lib/admin');
      const adminEmail = getAdminEmail();
      
      // Admin user'ı bul
      const adminUser = await prisma.user.findUnique({
        where: { email: adminEmail },
        select: { id: true },
      }).catch(() => null);
      
      // En az 1 kelime varsa, title'da bu kelimelerden en az birini içeren ilanları bul (OR condition - daha esnek)
      if (keywords.length >= 1) {
        // En önemli kelimeleri al (ilk 3 kelime genelde en önemli)
        const importantKeywords = keywords.slice(0, 3);
        
        const whereClause: Prisma.ListingWhereInput = {
          OR: [
            // En az bir önemli kelimeyi içeren ilanlar
            ...importantKeywords.map(keyword => ({
              title: {
                contains: keyword,
              },
            })),
          ],
          AND: [
            {
              OR: [
                {
                  isActive: true,
                  approvalStatus: 'approved',
                },
                // Admin ilanları için daha esnek filtre
                ...(adminUser ? [{
                  userId: adminUser.id,
                }] : []),
              ],
            },
          ],
        };
        
        let candidates: Array<{ id: string; title: string }> = [];
        try {
          candidates = await withTimeout(
            prisma.listing.findMany({
              where: whereClause,
              select: {
                id: true,
                title: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 200, // Daha fazla aday kontrol et
            }),
            5000 // 5 saniye timeout
          );
        } catch (error) {
          console.error(`[GET /api/listings/${slugOrId}] Aday ilanlar çekilirken hata:`, error);
          candidates = [];
        }
        
        // Adaylar arasında slug'ı tam eşleşen ilanı bul
        listing = candidates.find(l => {
          try {
            const listingSlug = createSlug(l.title);
            return listingSlug === slugOrId;
          } catch (error) {
            console.error(`[GET /api/listings/${slugOrId}] Slug oluşturulurken hata:`, error);
            return false;
          }
        });
      }
      
      // Eğer hala bulunamadıysa, son 500 ilanı çek ve slug ile eşleştir (fallback)
      // Admin ilanlarını da dahil et
      if (!listing) {
        const whereClause: Prisma.ListingWhereInput = {
          OR: [
            {
              isActive: true,
              approvalStatus: 'approved'
            },
            // Admin ilanları için daha esnek filtre
            ...(adminUser ? [{
              userId: adminUser.id,
            }] : []),
          ],
        };
        
        let recentListings: Array<{ id: string; title: string }> = [];
        try {
          recentListings = await withTimeout(
            prisma.listing.findMany({
              where: whereClause,
              select: {
                id: true,
                title: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 500, // Daha fazla ilan kontrol et
            }),
            5000 // 5 saniye timeout
          );
        } catch (error) {
          console.error(`[GET /api/listings/${slugOrId}] Son ilanlar çekilirken hata:`, error);
          recentListings = [];
        }
        
        listing = recentListings.find(l => {
          try {
            const listingSlug = createSlug(l.title);
            return listingSlug === slugOrId;
          } catch (error) {
            console.error(`[GET /api/listings/${slugOrId}] Slug oluşturulurken hata:`, error);
            return false;
          }
        });
      }
      
      // Eğer listing bulunduysa, tam detaylarını çek
      if (listing) {
        let fullListing;
        try {
          fullListing = await withTimeout(
            prisma.listing.findUnique({
              where: { id: listing.id },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    location: true,
                  },
                },
              },
            }),
            5000 // 5 saniye timeout
          );
        } catch (error) {
          console.error(`[GET /api/listings/${slugOrId}] İlan detayları çekilirken hata:`, error);
          fullListing = null;
        }
        
        if (!fullListing) {
          console.log(`[GET /api/listings/${slugOrId}] İlan detayları bulunamadı - ID: ${listing.id}`);
          listing = null;
        } else {
          // İlan bulunduysa ama aktif değilse veya onaylanmamışsa kontrol et
          if (!fullListing.isActive || fullListing.approvalStatus !== 'approved') {
          // Admin ilanı olabilir, yine de göster
          const { getAdminEmail } = await import('@/lib/admin');
          const adminEmail = getAdminEmail();
          
          // İlan sahibi kontrolü - pending durumundaki ilanlar sahibi tarafından görülebilir
          const isOwner = session?.user?.email && fullListing.user.email === session.user.email;
          
            if (fullListing.user.email !== adminEmail && !isOwner) {
              // Normal kullanıcı ilanı ama aktif değil ve sahibi değil - gösterme
              listing = null;
            } else {
              // Admin ilanı veya sahibi ise göster (aktif olmasa bile)
              listing = fullListing;
            }
          } else {
            listing = fullListing;
          }
        }
      }
    }

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    // Cache key (listing ID veya slug ile)
    const listingId = listing.id;
    const cacheKey = createCacheKey('listing-detail', listingId);
    
    // Public cache kontrolü (30 saniye TTL - listing detayları daha dinamik)
    // Not: views sadece owner/admin görebilir; bu yüzden cache sadece "public" response için kullanılır.
    const cachedPublic = getCache<{ listing: unknown }>(cacheKey);
    const isCacheHit = !!cachedPublic;

    // Views'i görebilir mi? (sadece ilan sahibi veya admin)
    const sessionEmail = session?.user?.email || null;
    const { isAdminEmail } = await import('@/lib/admin');
    const sessionUser = sessionEmail
      ? await prisma.user.findUnique({
          where: { email: sessionEmail },
          select: { id: true, role: true },
        }).catch(() => null)
      : null;
    const isAdmin =
      !!sessionEmail &&
      (((session?.user as any)?.role === 'admin') ||
        sessionUser?.role === 'admin' ||
        isAdminEmail(sessionEmail));
    const isOwner =
      !!sessionEmail &&
      (listing.user.email === sessionEmail ||
        (sessionUser?.id ? listing.userId === sessionUser.id : false));
    const canSeeViews = isAdmin || isOwner;
    
    // Views artırma (sadece cache miss olduğunda ve ilan sahibi değilse)
    if (!isCacheHit && listing.isActive && listing.approvalStatus === 'approved') {
      // Session kontrolü - ilan sahibi kendi ilanını görüntülediğinde views artırma
      const isOwner = session?.user?.email && listing.user.email === session.user.email;
      
      if (!isOwner) {
        // Views'i artır (async olarak, response'u bekletmeden)
        prisma.listing.update({
          where: { id: listingId },
          data: { views: { increment: 1 } }
        }).catch(error => {
          console.error('Views artırma hatası:', error);
          // Hata olsa bile devam et
        });
        
        // Listing objesini güncelle (response için)
        listing.views = (listing.views || 0) + 1;
      }
    }
    
    // Public cache'ten dön (owner/admin değilse)
    if (!canSeeViews && cachedPublic) {
      return NextResponse.json(cachedPublic, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          'X-Cache': 'HIT',
        },
      });
    }

    const parseArray = (val: string | null) => {
      if (!val) return [];
      
      // Base64 resim kontrolü - eğer veri zaten Base64 resim ise parse etme
      const isBase64 = typeof val === 'string' && val.startsWith('data:image');
      if (isBase64) {
        return [val];
      }
      
      // Eğer string değilse ve zaten array ise direkt döndür
      if (Array.isArray(val)) {
        return val;
      }
      
      // JSON parse denemesi - sadece JSON formatında ise
      if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
          return parsed ? [parsed] : [];
        } catch {
          // JSON parse başarısız - string olarak döndür
          return [val];
        }
      }
      
      // Diğer durumlarda string olarak döndür
      return typeof val === 'string' ? [val] : [];
    };

    const parseJson = (val: string | null) => {
      if (!val) return null;
      
      // Base64 resim kontrolü - eğer veri zaten Base64 resim ise parse etme
      if (typeof val === 'string' && val.startsWith('data:image')) {
        return val;
      }
      
      // Zaten object ise direkt döndür
      if (typeof val === 'object') {
        return val;
      }
      
      // JSON parse denemesi - sadece JSON formatında ise
      if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
        try {
          return JSON.parse(val);
        } catch {
          return null;
        }
      }
      
      return null;
    };

    const premiumFeatures = parseJson(listing.premiumFeatures);

    // Telefon numarasını çöz (şifrelenmişse)
    let decryptedUserPhone = listing.user.phone || null;
    if (decryptedUserPhone && decryptedUserPhone.trim() !== '') {
      try {
        // Şifrelenmiş telefon numaraları ":" içerir (format: IV:Tag:Encrypted)
        if (decryptedUserPhone.includes(':') && decryptedUserPhone.split(':').length === 3) {
          const decrypted = decryptPhone(decryptedUserPhone);
          if (decrypted) {
            decryptedUserPhone = decrypted;
          } else {
            decryptedUserPhone = null;
          }
        }
        // ":" içermiyorsa zaten düz metin, olduğu gibi kullan
      } catch (error) {
        console.error('Telefon çözme hatası:', error);
        decryptedUserPhone = null;
      }
    }

    const formattedListing = {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      location: listing.location,
      category: listing.category,
      subCategory: listing.subCategory,
      subSubCategory: listing.subSubCategory,
      phone: listing.phone,
      showPhone: listing.showPhone,
      images: parseArray(listing.images),
      features: parseArray(listing.features),
      condition: listing.condition,
      brand: listing.brand,
      isPremium: listing.isPremium,
      premiumFeatures,
      premiumUntil: listing.premiumUntil?.toISOString(),
      expiresAt: listing.expiresAt?.toISOString() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Varsayılan 30 gün
      // views sadece ilan sahibi ve admin görsün
      views: canSeeViews ? listing.views : undefined,
      isActive: listing.isActive,
      approvalStatus: listing.approvalStatus,
      createdAt: listing.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: listing.updatedAt?.toISOString() || new Date().toISOString(),
      user: {
        ...listing.user,
        phone: decryptedUserPhone,
      },
    };

    const response = { listing: formattedListing };

    // Cache'e kaydet (30 saniye TTL) - sadece public response için
    if (!canSeeViews) {
      setCache(cacheKey, response, 30000);
    }

    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': !canSeeViews
          ? 'public, s-maxage=30, stale-while-revalidate=60'
          : 'private, no-store, no-cache, must-revalidate',
        'X-Cache': !canSeeViews ? 'MISS' : 'BYPASS',
      },
    });
  } catch (error) {
    console.error('İlan getirme hatası:', error);
    console.error('Hata detayı:', error instanceof Error ? error.stack : String(error));
    
    // Timeout hatası
    if (error instanceof Error && error.message.includes('timeout')) {
      console.error('Request timeout:', error.message);
      return NextResponse.json(
        { error: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.' },
        { 
          status: 504,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }
    
    // Prisma bağlantı hatası kontrolü
    if (error instanceof Error) {
      if (error.message.includes('P1001') || error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
        console.error('Veritabanı bağlantı hatası:', error.message);
        return NextResponse.json(
          { error: 'Veritabanı bağlantı hatası. Lütfen daha sonra tekrar deneyin.' },
          { 
            status: 503,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
          }
        );
      }
    }
    
    // Detaylı hata mesajı (development için)
    const errorMessage = error instanceof Error 
      ? error.message 
      : String(error);
    const errorDetails = process.env.NODE_ENV === 'development' 
      ? { message: errorMessage, stack: error instanceof Error ? error.stack : undefined }
      : { message: 'İlan yüklenirken hata oluştu' };
    
    return NextResponse.json(
      { 
        error: 'İlan yüklenirken hata oluştu',
        ...errorDetails
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

// PUT - İlan güncelle (sadece ilan sahibi)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { id: slugOrId } = await params;
    const body = await request.json();

    // Slug'dan ID çıkarmayı dene
    const possibleId = extractIdFromSlug(slugOrId);
    
    let listing;
    if (possibleId) {
      listing = await prisma.listing.findUnique({
        where: { id: possibleId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });
    } else {
      // Slug formatı - Daha esnek arama (GET ile aynı mantık)
      const keywords = slugOrId
        .split('-')
        .filter(word => word.length > 1) // 1 karakterden uzun kelimeleri al (daha esnek)
        .slice(0, 10); // İlk 10 kelimeyi al
      
      if (keywords.length >= 1) {
        // En önemli kelimeleri al (ilk 3 kelime genelde en önemli)
        const importantKeywords = keywords.slice(0, 3);
        
        const candidates = await withTimeout(
          prisma.listing.findMany({
            where: {
              isActive: true,
              approvalStatus: 'approved',
              OR: importantKeywords.map(keyword => ({
                title: {
                  contains: keyword,
                },
              })),
            },
            select: {
              id: true,
              title: true,
              userId: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 200, // Daha fazla aday kontrol et
          }),
          5000 // Timeout
        );
        
        listing = candidates.find(l => {
          const listingSlug = createSlug(l.title);
          return listingSlug === slugOrId;
        });
      }
      
      if (!listing) {
        const recentListings = await withTimeout(
          prisma.listing.findMany({
            where: {
              isActive: true,
              approvalStatus: 'approved'
            },
            select: {
              id: true,
              title: true,
              userId: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 500, // Daha fazla ilan kontrol et
          }),
          5000 // Timeout
        );
        
        listing = recentListings.find(l => {
          const listingSlug = createSlug(l.title);
          return listingSlug === slugOrId;
        });
      }
      
      if (listing) {
        listing = await withTimeout(
          prisma.listing.findUnique({
            where: { id: listing.id },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          }),
          5000 // 5 saniye timeout
        ) as any;
      }
    }

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcı bilgilerini al
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // İlan sahibi kontrolü
    const isOwner = listing.userId === user.id;
    const userRole = user.role;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Bu ilanı düzenleme yetkiniz yok' },
        { status: 403 }
      );
    }

    // Resim kontrolü - resim yoksa ilan yayınlanamaz
    const imagesArray = typeof body.images === 'string' 
      ? (body.images ? JSON.parse(body.images) : [])
      : (body.images || []);
    
    if (!imagesArray || !Array.isArray(imagesArray) || imagesArray.length === 0) {
      return NextResponse.json(
        { error: 'En az bir resim yüklemelisiniz. Resim olmadan ilan yayınlanamaz.' },
        { status: 400 }
      );
    }

    // Güncelleme verilerini hazırla
    const updateData: Prisma.ListingUpdateInput = {
      title: body.title,
      description: body.description,
      price: parseFloat(body.price),
      category: body.category,
      subCategory: body.subCategory || null,
      subSubCategory: body.subSubCategory || null,
      location: body.location,
      phone: body.phone || null,
      condition: body.condition || null,
      brand: body.brand || null,
      images: typeof body.images === 'string' ? body.images : JSON.stringify(imagesArray),
      features: typeof body.features === 'string' ? body.features : JSON.stringify(body.features || []),
      showPhone: body.showPhone !== false,
      isPremium: body.isPremium || false,
      premiumFeatures: body.premiumFeatures 
        ? (typeof body.premiumFeatures === 'string' 
            ? body.premiumFeatures 
            : JSON.stringify(body.premiumFeatures))
        : null,
      premiumUntil: body.premiumUntil ? new Date(body.premiumUntil) : null,
    };

    // İlanı güncelle
    const updatedListing = await prisma.listing.update({
      where: { id: listing.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            location: true,
          },
        },
      },
    });

    // Formatlanmış veriyi döndür
    const parseArray = (val: string | null) => {
      if (!val) return [];
      
      // Base64 resim kontrolü - eğer veri zaten Base64 resim ise parse etme
      const isBase64 = typeof val === 'string' && val.startsWith('data:image');
      if (isBase64) {
        return [val];
      }
      
      // Eğer string değilse ve zaten array ise direkt döndür
      if (Array.isArray(val)) {
        return val;
      }
      
      // JSON parse denemesi - sadece JSON formatında ise
      if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
          return parsed ? [parsed] : [];
        } catch {
          // JSON parse başarısız - string olarak döndür
          return [val];
        }
      }
      
      // Diğer durumlarda string olarak döndür
      return typeof val === 'string' ? [val] : [];
    };

    const parseJson = (val: string | null) => {
      if (!val) return null;
      if (typeof val === 'object') return val;
      if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
        try {
          return JSON.parse(val);
        } catch {
          return null;
        }
      }
      return null;
    };

    const formattedListing = {
      id: updatedListing.id,
      title: updatedListing.title,
      description: updatedListing.description,
      price: updatedListing.price,
      location: updatedListing.location,
      category: updatedListing.category,
      subCategory: updatedListing.subCategory,
      subSubCategory: updatedListing.subSubCategory,
      phone: updatedListing.phone,
      showPhone: updatedListing.showPhone,
      images: parseArray(updatedListing.images),
      features: parseArray(updatedListing.features),
      condition: updatedListing.condition,
      brand: updatedListing.brand,
      isPremium: updatedListing.isPremium,
      premiumFeatures: parseJson(updatedListing.premiumFeatures),
      premiumUntil: updatedListing.premiumUntil?.toISOString(),
      expiresAt: updatedListing.expiresAt?.toISOString() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Varsayılan 30 gün
      views: updatedListing.views,
      isActive: updatedListing.isActive,
      approvalStatus: updatedListing.approvalStatus,
      createdAt: updatedListing.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: updatedListing.updatedAt?.toISOString() || new Date().toISOString(),
      user: updatedListing.user,
    };

    // Cache invalidation - listing detay, homepage ve category cache'lerini temizle
    deleteCache(createCacheKey('listing-detail', updatedListing.id));
    clearCachePattern('homepage-listings');
    clearCachePattern('category-listings');

    return NextResponse.json({ 
      message: 'İlan başarıyla güncellendi',
      listing: formattedListing 
    });
  } catch (error) {
    console.error('İlan güncelleme hatası:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'İlan güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PATCH - İlan durumunu güncelle (sadece ilan sahibi)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { id: slugOrId } = await params;
    const body = await request.json();

    // Slug'dan ID çıkarmayı dene
    const possibleId = extractIdFromSlug(slugOrId);
    
    let listing;
    if (possibleId) {
      listing = await prisma.listing.findUnique({
        where: { id: possibleId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });
    } else {
      // Slug formatı - basit arama
      const keywords = slugOrId
        .split('-')
        .filter(word => word.length > 1)
        .slice(0, 3);
      
      if (keywords.length >= 1) {
        const candidates = await withTimeout(
          prisma.listing.findMany({
            where: {
              OR: keywords.map(keyword => ({
                title: {
                  contains: keyword,
                },
              })),
            },
            select: {
              id: true,
              title: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
          }),
          5000
        );
        
        listing = candidates.find(l => {
          const listingSlug = createSlug(l.title);
          return listingSlug === slugOrId;
        });
      }
      
      if (listing) {
        listing = await withTimeout(
          prisma.listing.findUnique({
            where: { id: listing.id },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          }),
          5000
        ) as any;
      }
    }

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcı bilgilerini al
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // İlan sahibi kontrolü
    const isOwner = listing.userId === user.id;
    const userRole = user.role;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Bu ilanı güncelleme yetkiniz yok' },
        { status: 403 }
      );
    }

    // Ödeme bekleyen (payment_pending) ilanlar, ödeme tamamlanmadan "pending" (moderasyon kuyruğu) durumuna alınamaz.
    // Bu kontrol, frontend/localStorage manipülasyonları ile bypass edilmesini engeller.
    if (body.approvalStatus === 'pending' && listing.approvalStatus === 'payment_pending') {
      const hasPremiumApplied = Boolean((listing as any).isPremium && (listing as any).premiumUntil);
      const paidInvoice = await prisma.invoice.findFirst({
        where: {
          listingId: listing.id,
          status: 'paid',
        },
        select: { id: true },
      });

      if (!paidInvoice && !hasPremiumApplied) {
        return NextResponse.json(
          { error: 'Ödeme tamamlanmadan ilan onaya gönderilemez.' },
          { status: 400 }
        );
      }
    }

    // Güncelleme verilerini hazırla (sadece approvalStatus güncellenebilir)
    const updateData: Prisma.ListingUpdateInput = {};
    
    if (body.approvalStatus) {
      updateData.approvalStatus = body.approvalStatus;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Güncellenecek alan belirtilmedi' },
        { status: 400 }
      );
    }

    // İlanı güncelle
    const updatedListing = await prisma.listing.update({
      where: { id: listing.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      message: 'İlan durumu başarıyla güncellendi',
      listing: {
        id: updatedListing.id,
        approvalStatus: updatedListing.approvalStatus,
      }
    });
  } catch (error) {
    console.error('İlan durumu güncelleme hatası:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'İlan durumu güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - İlan sil (sadece ilan sahibi veya admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { id: slugOrId } = await params;

    // Slug'dan ID çıkarmayı dene
    const possibleId = extractIdFromSlug(slugOrId);
    
    let listing;
    if (possibleId) {
      // Eski ID formatı - direkt ID ile ara
      listing = await prisma.listing.findUnique({
        where: { id: possibleId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });
    } else {
      // Slug formatı - Daha esnek arama (GET ile aynı mantık)
      const keywords = slugOrId
        .split('-')
        .filter(word => word.length > 1) // 1 karakterden uzun kelimeleri al (daha esnek)
        .slice(0, 10); // İlk 10 kelimeyi al
      
      if (keywords.length >= 1) {
        // En önemli kelimeleri al (ilk 3 kelime genelde en önemli)
        const importantKeywords = keywords.slice(0, 3);
        
        const candidates = await withTimeout(
          prisma.listing.findMany({
            where: {
              isActive: true,
              approvalStatus: 'approved',
              OR: importantKeywords.map(keyword => ({
                title: {
                  contains: keyword,
                },
              })),
            },
            select: {
              id: true,
              title: true,
              userId: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 200, // Daha fazla aday kontrol et
          }),
          5000 // Timeout
        );
        
        listing = candidates.find(l => {
          const listingSlug = createSlug(l.title);
          return listingSlug === slugOrId;
        });
      }
      
      if (!listing) {
        const recentListings = await withTimeout(
          prisma.listing.findMany({
            where: {
              isActive: true,
              approvalStatus: 'approved'
            },
            select: {
              id: true,
              title: true,
              userId: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 500, // Daha fazla ilan kontrol et
          }),
          5000 // Timeout
        );
        
        listing = recentListings.find(l => {
          const listingSlug = createSlug(l.title);
          return listingSlug === slugOrId;
        });
      }
      
      if (listing) {
        listing = await withTimeout(
          prisma.listing.findUnique({
            where: { id: listing.id },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          }),
          5000 // 5 saniye timeout
        ) as any;
      }
    }

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcı bilgilerini al
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Admin veya ilan sahibi kontrolü
    const userRole = (user as any)?.role;
    const isAdmin = userRole === 'admin';
    const isOwner = listing.userId === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Bu ilanı silme yetkiniz yok' },
        { status: 403 }
      );
    }

    // İlişkili kayıtları temizle
    try {
      // Favorilerden kaldır
      await prisma.userFavorite.deleteMany({
        where: { listingId: listing.id },
      }).catch(() => {});

      // Mesajları güncelle (listingId null yapılacak)
      await prisma.message.updateMany({
        where: { listingId: listing.id },
        data: { listingId: null },
      }).catch(() => {});
    } catch (cleanupError) {
      console.warn('İlişkili kayıtlar temizlenirken hata:', cleanupError);
    }

    // İlanı sil
    const listingId = listing.id;
    try {
      await prisma.listing.delete({
        where: { id: listingId },
      });
    } catch (deleteError: unknown) {
      // Eğer ilan zaten silinmişse, başarılı say
      if (deleteError && typeof deleteError === 'object' && 'code' in deleteError && deleteError.code === 'P2025') {
        return NextResponse.json({
          message: 'İlan zaten silinmiş',
        });
      }
      throw deleteError;
    }

    // Cache invalidation - listing detay, homepage ve category cache'lerini temizle
    deleteCache(createCacheKey('listing-detail', listingId));
    clearCachePattern('homepage-listings');
    clearCachePattern('category-listings');

    return NextResponse.json({
      message: 'İlan başarıyla silindi',
    });
  } catch (error) {
    console.error('İlan silme hatası:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'İlan silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

