import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAdminEmail } from '@/lib/admin';
import { Prisma } from '@prisma/client';
import { createListingSchema } from '@/lib/validations/listing';
import { clearCachePattern } from '@/lib/cache';

// Tüm ilanları getir (sayfalama ile)
export async function GET(request: NextRequest) {
  try {
    console.log('[GET /api/listings] Request received');
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    console.log(`[GET /api/listings] Fetching page ${page}, limit ${limit}, search: ${search}`);

    // Admin kullanıcısını bul (ilanlarını hariç tutmak için)
    const adminUser = await prisma.user.findUnique({
      where: { email: getAdminEmail() },
      select: { id: true },
    });

    // Sadece aktif ve onaylanmış ilanları getir
    const baseWhere: Prisma.ListingWhereInput = {
      isActive: true,
      approvalStatus: 'approved',
      expiresAt: {
        gt: new Date() // Süresi dolmamış ilanlar
      }
    };

    // Arama terimi varsa, admin filtresini kaldır (arama sonuçlarında admin ilanları da görünsün)
    // Arama yoksa, admin kullanıcısının ilanlarını hariç tut
    let where: Prisma.ListingWhereInput = baseWhere;
    if (!search || !search.trim()) {
      // Arama yoksa, admin kullanıcısının ilanlarını hariç tut
      if (adminUser) {
        baseWhere.userId = { not: adminUser.id };
        where = baseWhere;
      }
    } else {
      // Arama varsa, admin filtresini kaldır ve arama yap
      const searchTerm = search.trim();
      console.log(`[GET /api/listings] Arama terimi: "${searchTerm}"`);
      
      // Arama koşullarını baseWhere ile birleştir (admin filtresi YOK)
      // Öncelik: title ve description (en önemli), sonra category, subCategory, location
      where = {
        AND: [
          baseWhere, // Admin filtresi yok, sadece aktif/onaylanmış/süresi dolmamış
          {
            OR: [
              // Başlıkta ara (en önemli)
              { title: { contains: searchTerm, mode: 'insensitive' } },
              // Açıklamada ara (ikinci öncelik)
              { description: { contains: searchTerm, mode: 'insensitive' } },
              // Kategori ve alt kategoride ara
              { category: { contains: searchTerm, mode: 'insensitive' } },
              { subCategory: { contains: searchTerm, mode: 'insensitive' } },
              // Konumda ara
              { location: { contains: searchTerm, mode: 'insensitive' } }
            ]
          }
        ]
      };
      console.log(`[GET /api/listings] Arama where koşulu (title ve description öncelikli, admin filtresi YOK):`, JSON.stringify(where, null, 2));
    }

    // Debug: Arama terimi varsa, önce tüm arama terimi içeren ilanları kontrol et (filtre olmadan)
    if (search && search.trim()) {
      const searchTerm = search.trim();
      try {
        const debugListings = await prisma.listing.findMany({
          where: {
            OR: [
              { title: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } }
            ]
          },
          select: {
            id: true,
            title: true,
            isActive: true,
            approvalStatus: true,
            expiresAt: true,
            userId: true,
            user: {
              select: {
                email: true
              }
            }
          },
          take: 10
        });
        console.log(`[GET /api/listings] DEBUG: "${searchTerm}" içeren ${debugListings.length} ilan bulundu (filtre olmadan)`);
        if (debugListings.length > 0) {
          debugListings.forEach((l, idx) => {
            const isExpired = l.expiresAt ? new Date(l.expiresAt) < new Date() : false;
            const isAdminUser = adminUser && l.userId === adminUser.id;
            console.log(`[GET /api/listings] DEBUG İlan ${idx + 1}:`, JSON.stringify({
              title: l.title,
              isActive: l.isActive,
              approvalStatus: l.approvalStatus,
              expiresAt: l.expiresAt,
              isExpired: isExpired,
              userEmail: l.user?.email,
              userId: l.userId,
              isAdminUser: isAdminUser,
              adminUserId: adminUser?.id
            }, null, 2));
          });
        } else {
          console.log(`[GET /api/listings] DEBUG: Veritabanında "${searchTerm}" içeren hiç ilan bulunamadı`);
        }
      } catch (debugError) {
        console.error(`[GET /api/listings] DEBUG hatası:`, debugError);
      }
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        select: {
          id: true,
          title: true,
          price: true,
          location: true,
          category: true,
          subCategory: true,
          description: true,
          images: true,
          createdAt: true,
          isPremium: true,
          views: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    console.log(`[GET /api/listings] Found ${listings.length} listings, total: ${total}`);

    // Images'ı parse et - Base64 kontrolü ile
    const formattedListings = listings.map(listing => {
      let images: string[] = [];
      
      // Base64 resim kontrolü
      if (typeof listing.images === 'string' && listing.images.startsWith('data:image')) {
        images = [listing.images];
      } else if (Array.isArray(listing.images)) {
        images = listing.images;
      } else if (typeof listing.images === 'string') {
        // JSON parse denemesi - sadece JSON formatında ise
        if (listing.images.startsWith('[') || listing.images.startsWith('{')) {
          try {
            images = JSON.parse(listing.images);
            if (!Array.isArray(images)) {
              images = images ? [images] : [];
            }
          } catch {
            images = [];
          }
        } else {
          images = [listing.images];
        }
      }

      return {
        ...listing,
        images,
        description: listing.description?.substring(0, 200) + (listing.description?.length > 200 ? '...' : ''),
      };
    });

    return NextResponse.json({
      listings: formattedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120', // 60 saniye cache
      },
    });
  } catch (error) {
    console.error('[GET /api/listings] Error:', error);
    return NextResponse.json(
      { error: 'İlanlar yüklenirken bir hata oluştu', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Zod validation
    const validationResult = createListingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validasyon hatası',
          details: validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
    const {
      title,
      description,
      price,
      category,
      subCategory,
      subSubCategory,
      location,
      phone,
      showPhone,
      images,
      features,
      condition,
      brand,
      isPremium,
      premiumFeatures,
      premiumUntil,
      expiresAt,
    } = validatedData;

    // Kullanıcıyı bul veya oluştur
    let user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    // Kullanıcı yoksa oluştur (Google ile giriş yapıldığında olabilir)
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            email: session.user.email!,
            name: session.user.name || 'Kullanıcı',
            password: '', // Google ile giriş yapanların şifresi yok
            phone: null,
            location: null,
          },
        });
      } catch (error) {
        console.error('Kullanıcı oluşturma hatası:', error);
        return NextResponse.json(
          { error: 'Kullanıcı oluşturulamadı. Lütfen tekrar giriş yapın.' },
          { status: 500 }
        );
      }
    }

    // Admin kontrolü - Admin kullanıcıları ilan limitinden muaf
    // Hem role hem de email kontrolü yap (daha güvenli)
    const { isAdminEmail } = await import('@/lib/admin');
    const isAdmin = user.role === 'admin' || isAdminEmail(user.email);
    
    // İlan limit kontrolü (sadece admin olmayan kullanıcılar için)
    if (!isAdmin) {
      // Kullanıcının aktif ilan sayısını kontrol et
      const activeListings = await prisma.listing.findMany({
        where: {
          userId: user.id,
          isActive: true,
          expiresAt: {
            gt: new Date()
          },
          approvalStatus: 'approved'
        },
        select: {
          id: true
        }
      });

      const activeListingCount = activeListings.length;

      // Kullanıcının aktif aboneliğini kontrol et
      const activeSubscription = await prisma.subscription.findFirst({
        where: {
          userId: user.id,
          isActive: true,
          endDate: {
            gt: new Date()
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Admin ayarlarından limitleri al
      let adminSettings = {
        noneMaxListings: 0,
        monthlyMaxListings: 0,
        quarterlyMaxListings: 0,
        yearlyMaxListings: 20
      };

      try {
        const settingsRecord = await prisma.settings.findUnique({
          where: { key: 'admin_settings' }
        });
        if (settingsRecord) {
          const parsed = JSON.parse(settingsRecord.value);
          adminSettings = {
            noneMaxListings: parsed.noneMaxListings ?? 0,
            monthlyMaxListings: parsed.monthlyMaxListings ?? 0,
            quarterlyMaxListings: parsed.quarterlyMaxListings ?? 0,
            yearlyMaxListings: parsed.yearlyMaxListings ?? 20
          };
        }
      } catch (error) {
        console.error('Admin ayarları okuma hatası:', error);
        // Hata durumunda varsayılan değerler kullanılacak
      }

      let maxListings = 0;
      if (activeSubscription) {
        switch (activeSubscription.planType) {
          case 'monthly':
            maxListings = adminSettings.monthlyMaxListings;
            break;
          case 'quarterly':
            maxListings = adminSettings.quarterlyMaxListings;
            break;
          case 'yearly':
            maxListings = adminSettings.yearlyMaxListings;
            break;
          default:
            maxListings = adminSettings.noneMaxListings;
        }
      } else {
        // Abonelik yoksa ücretsiz plan limiti
        maxListings = adminSettings.noneMaxListings;
      }

      // Limit kontrolü (0 değeri limit yok demektir)
      if (maxListings > 0 && activeListingCount >= maxListings) {
        return NextResponse.json(
          { error: `Maksimum ${maxListings} aktif ilanınız olabilir. Lütfen mevcut ilanlarınızdan birini kapatın veya süresi dolmasını bekleyin.` },
          { status: 400 }
        );
      }
    }

    // Premium plan seçilmişse, ödeme yapılmadan premium yapılmamalı
    // Ödeme başarılı olduğunda webhook'ta isPremium: true yapılacak
    const shouldBePremium = isPremium || false;
    const hasPremiumFeatures = premiumFeatures && (
      typeof premiumFeatures === 'string' 
        ? JSON.parse(premiumFeatures) 
        : premiumFeatures
    ) && Object.keys(typeof premiumFeatures === 'string' ? JSON.parse(premiumFeatures) : premiumFeatures).length > 0;
    
    // Premium plan veya premium özellik seçilmişse, ödeme bekliyor demektir
    // Bu durumda isPremium: false olmalı (ödeme yapılmadan premium olmamalı)
    // approvalStatus: 'pending' olmalı ama ödeme yapılmadan onaya gönderilmemeli
    const finalIsPremium = false; // Ödeme yapılmadan premium olmamalı
    const finalApprovalStatus = (shouldBePremium || hasPremiumFeatures) 
      ? 'pending' // Premium seçilmişse pending (ama ödeme bekliyor)
      : 'pending'; // Ücretsiz plan seçilmişse direkt pending

    // İlanı oluştur
    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: price, // Validation schema zaten number döndürüyor
        category,
        subCategory: subCategory || null,
        subSubCategory: subSubCategory || null,
        location,
        phone: phone || null,
        showPhone: showPhone !== false,
        images: JSON.stringify(images || []),
        features: JSON.stringify(features || []),
        condition: condition || null,
        brand: brand || null,
        isPremium: finalIsPremium, // Ödeme yapılmadan premium olmamalı
        premiumFeatures: premiumFeatures ? JSON.stringify({
          ...(typeof premiumFeatures === 'string' ? JSON.parse(premiumFeatures) : premiumFeatures),
          contactOptions: (typeof premiumFeatures === 'string' ? JSON.parse(premiumFeatures) : premiumFeatures)?.contactOptions || { showPhone: true, showWhatsApp: true, showMessage: true }
        }) : null,
        premiumUntil: null, // Ödeme yapılmadan premiumUntil null olmalı
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün sonra
        views: 0,
        isActive: true,
        approvalStatus: finalApprovalStatus,
        userId: user.id,
      },
    });

    // Cache invalidation - homepage ve category cache'lerini temizle
    clearCachePattern('homepage-listings');
    clearCachePattern('category-listings');

    // Admin'e bildirim gönder (sadece onay bekleyen ilanlar için)
    if (finalApprovalStatus === 'pending') {
      try {
        // Email bildirimi (async, hata olsa bile devam et)
        const { notifyAdminNewListing } = await import('@/lib/email');
        notifyAdminNewListing({
          id: listing.id,
          title: listing.title,
          user: {
            name: user.name || 'Kullanıcı',
            email: user.email,
          },
          category: category,
          price: price,
        }).catch((error) => {
          console.error('Email bildirimi gönderme hatası:', error);
        });

        // Database notification (async, hata olsa bile devam et)
        const { createAdminNotificationForNewListing } = await import('@/lib/notifications');
        createAdminNotificationForNewListing({
          id: listing.id,
          title: listing.title,
          user: {
            name: user.name || 'Kullanıcı',
            email: user.email,
          },
          category: category,
          price: price,
        }).catch((error) => {
          console.error('Database notification oluşturma hatası:', error);
        });
      } catch (error) {
        // Bildirim hatası kritik değil, devam et
        console.error('Bildirim gönderme hatası:', error);
      }
    }

    return NextResponse.json(
      {
        message: 'İlanınız başarıyla oluşturuldu. Moderatör onayından sonra yayınlanacaktır.',
        listing,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('İlan oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'İlan oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
  // NOT: $disconnect() çağrısını kaldırdık - Prisma connection pool otomatik yönetir
}

