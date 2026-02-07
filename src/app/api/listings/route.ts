import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { createListingSchema } from '@/lib/validations/listing';
import { clearCachePattern } from '@/lib/cache';
import { handleApiError } from '@/lib/api-error';

// Tüm ilanları getir (sayfalama ile)
export async function GET(request: NextRequest) {
  try {
    const DEBUG =
      process.env.NODE_ENV !== 'production' || process.env.DEBUG_LISTINGS === 'true';

    if (DEBUG) {
      console.log('[GET /api/listings] Request received');
    }
    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email || null;
    const { isAdminEmail } = await import('@/lib/admin');
    const dbUser = sessionEmail
      ? await prisma.user.findUnique({ where: { email: sessionEmail }, select: { role: true } }).catch(() => null)
      : null;
    const isAdmin =
      !!sessionEmail &&
      (((session?.user as any)?.role === 'admin') || dbUser?.role === 'admin' || isAdminEmail(sessionEmail));

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limitRaw = parseInt(searchParams.get('limit') || '20');
    // Abuse/DoS prevention: cap limit
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 20;
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    if (DEBUG) {
      console.log(`[GET /api/listings] Fetching page ${page}, limit ${limit}, search: ${search}`);
    }

    // Sadece aktif ve onaylanmış ilanları getir
    // NOT: Admin ilanları da görünüyor (admin filtresi kaldırıldı)
    const baseWhere: Prisma.ListingWhereInput = {
      isActive: true,
      approvalStatus: 'approved',
      expiresAt: {
        gt: new Date() // Süresi dolmamış ilanlar
      }
    };

    // Debug: Toplam ilan sayısını kontrol et (prod'da kapalı: ekstra DB load)
    if (DEBUG) {
      const totalActiveListings = await prisma.listing.count({
        where: {
          isActive: true,
          approvalStatus: 'approved',
        }
      });
      const totalNonExpiredListings = await prisma.listing.count({
        where: baseWhere
      });
      console.log(`[GET /api/listings] Debug - Toplam aktif ilan: ${totalActiveListings}, Süresi dolmamış: ${totalNonExpiredListings}`);
    }

    // Arama terimi varsa, arama yap
    let where: Prisma.ListingWhereInput = baseWhere;
    if (search && search.trim()) {
      // Arama varsa, admin filtresini kaldır ve arama yap
      const searchTerm = search.trim();
      if (DEBUG) {
        console.log(`[GET /api/listings] Arama terimi: "${searchTerm}"`);
      }
      
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
      if (DEBUG) {
        console.log(
          `[GET /api/listings] Arama where koşulu (title ve description öncelikli, admin filtresi YOK):`,
          JSON.stringify(where, null, 2)
        );
      }
    }

    // Debug: Arama terimi varsa, önce tüm arama terimi içeren ilanları kontrol et (filtre olmadan)
    if (DEBUG && search && search.trim()) {
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
            console.log(`[GET /api/listings] DEBUG İlan ${idx + 1}:`, JSON.stringify({
              title: l.title,
              isActive: l.isActive,
              approvalStatus: l.approvalStatus,
              expiresAt: l.expiresAt,
              isExpired: isExpired,
              userEmail: l.user?.email,
              userId: l.userId
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
          ...(isAdmin ? { views: true } : {}),
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

    if (DEBUG) {
      console.log(`[GET /api/listings] Found ${listings.length} listings, total: ${total}`);
    }

    // Images'ı parse et - Base64 kontrolü ile
    const formattedListings = listings.map((listing: any) => {
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

      const formatted: any = {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        location: listing.location,
        category: listing.category,
        subCategory: listing.subCategory,
        description: listing.description?.substring(0, 200) + (listing.description?.length > 200 ? '...' : ''),
        images,
        createdAt: listing.createdAt,
        isPremium: listing.isPremium,
        user: listing.user,
      };

      // views sadece admin görebilsin (public listelerde gösterilmesin)
      if (isAdmin && typeof listing.views === 'number') {
        formatted.views = listing.views;
      }

      return formatted;
    });

    // IMPORTANT:
    // Admin response can include `views`. Never cache that publicly, otherwise it can leak via CDN caches.
    const cacheControl = isAdmin
      ? 'private, no-store, no-cache, must-revalidate'
      : 'public, s-maxage=60, stale-while-revalidate=120';

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
        'Cache-Control': cacheControl,
        // In case upstream caches vary by cookie/session.
        'Vary': 'Cookie',
      },
    });
  } catch (error) {
    return handleApiError(error);
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
        return handleApiError(error);
      }
    }

    // Otomatik doldurma: Kullanıcı ilan verirken telefon girdiyse ve profilde telefon yoksa
    // kullanıcı profiline bu telefonu yaz (şifreli).
    const incomingPhone = typeof phone === 'string' ? phone.trim() : '';
    const shouldAutofillUserPhone = Boolean(incomingPhone) && !user.phone;

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
    // Ödeme başarılı olduğunda webhook/callback/process ile isPremium/premiumUntil set edilecek
    const shouldBePremium = Boolean(isPremium);

    // premiumFeatures string | object | array olabilir (frontend bazen string[] gönderiyor)
    const parsedPremiumFeatures = (() => {
      if (!premiumFeatures) return null;
      try {
        return typeof premiumFeatures === 'string' ? JSON.parse(premiumFeatures) : premiumFeatures;
      } catch {
        return premiumFeatures;
      }
    })();

    const hasPremiumFeatures =
      Array.isArray(parsedPremiumFeatures)
        ? parsedPremiumFeatures.length > 0
        : parsedPremiumFeatures && typeof parsedPremiumFeatures === 'object'
          ? Object.keys(parsedPremiumFeatures as Record<string, unknown>).length > 0
          : false;

    const requiresPayment = shouldBePremium || hasPremiumFeatures;

    // Ödeme yapılmadan premium olmamalı
    const finalIsPremium = false;

    // Ödeme gerektiren ilanlar, ödeme tamamlanana kadar moderatör onay kuyruğuna düşmemeli
    // Not: approvalStatus alanı String olduğu için migration olmadan yeni bir durum kullanıyoruz.
    const finalApprovalStatus = requiresPayment ? 'payment_pending' : 'pending';

    // İlanı oluştur
    const listing = await prisma.$transaction(async (tx) => {
      if (shouldAutofillUserPhone) {
        const { encryptPhone } = await import('@/lib/encryption');
        const phoneData = encryptPhone(incomingPhone);
        await tx.user.update({
          where: { id: user.id },
          data: { phone: phoneData.encrypted },
          select: { id: true },
        });
      }

      return tx.listing.create({
        data: {
          title,
          description,
          price: price, // Validation schema zaten number döndürüyor
          category,
          subCategory: subCategory || null,
          subSubCategory: subSubCategory || null,
          location,
          phone: incomingPhone || null,
          showPhone: showPhone !== false,
          images: JSON.stringify(images || []),
          features: JSON.stringify(features || []),
          condition: condition || null,
          brand: brand || null,
          isPremium: finalIsPremium, // Ödeme yapılmadan premium olmamalı
          premiumFeatures: premiumFeatures
            ? JSON.stringify({
                ...(typeof premiumFeatures === 'string' ? JSON.parse(premiumFeatures) : premiumFeatures),
                contactOptions:
                  (typeof premiumFeatures === 'string' ? JSON.parse(premiumFeatures) : premiumFeatures)?.contactOptions || {
                    showPhone: true,
                    showWhatsApp: true,
                    showMessage: true,
                  },
              })
            : null,
          premiumUntil: null, // Ödeme yapılmadan premiumUntil null olmalı
          expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün sonra
          views: 0,
          isActive: true,
          approvalStatus: finalApprovalStatus,
          userId: user.id,
        },
      });
    });

    // Cache invalidation - homepage ve category cache'lerini temizle
    clearCachePattern('homepage-listings');
    clearCachePattern('category-listings');

    // İlan sahibine bilgilendirme maili gönder (async)
    try {
      const { sendListingSubmittedEmail } = await import('@/lib/email');
      sendListingSubmittedEmail({
        listing: { id: listing.id, title: listing.title },
        user: { name: user.name, email: user.email },
        approvalStatus: finalApprovalStatus,
      }).catch((error) => {
        console.error('İlan alındı maili gönderme hatası:', error);
      });
    } catch (error) {
      // Email hatası kritik değil
      console.error('İlan alındı maili gönderme hatası:', error);
    }

    // Admin'e bildirim gönder (sadece gerçekten moderatör onayı bekleyen ilanlar için)
    // payment_pending durumunda (ödeme bekliyor) bildirim gönderme
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

        // WhatsApp bildirimi (Meta Cloud API) - opsiyonel, env varsa çalışır
        const { notifyAdminNewListingWhatsApp } = await import('@/lib/whatsapp');
        notifyAdminNewListingWhatsApp({
          id: listing.id,
          title: listing.title,
          user: {
            name: user.name || 'Kullanıcı',
            email: user.email,
          },
          category: category,
          price: price,
        }).catch((error) => {
          console.error('WhatsApp bildirimi gönderme hatası:', error);
        });
      } catch (error) {
        // Bildirim hatası kritik değil, devam et
        console.error('Bildirim gönderme hatası:', error);
      }
    }

    return NextResponse.json(
      {
        message:
          finalApprovalStatus === 'payment_pending'
            ? 'İlanınız oluşturuldu. Yayınlanması için ödemenizi tamamlayın.'
            : 'İlanınız başarıyla oluşturuldu. Moderatör onayından sonra yayınlanacaktır.',
        listing,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

