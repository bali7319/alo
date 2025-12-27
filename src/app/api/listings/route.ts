import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Tüm ilanları getir (sayfalama ile)
export async function GET(request: NextRequest) {
  try {
    console.log('[GET /api/listings] Request received');
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    console.log(`[GET /api/listings] Fetching page ${page}, limit ${limit}`);

    // Admin kullanıcısını bul (ilanlarını hariç tutmak için)
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@alo17.tr' },
      select: { id: true },
    });

    // Sadece aktif ve onaylanmış ilanları getir
    // Admin kullanıcısının ilanlarını hariç tut
    const where: any = {
      isActive: true,
      approvalStatus: 'approved',
      expiresAt: {
        gt: new Date() // Süresi dolmamış ilanlar
      }
    };

    // Admin kullanıcısının ilanlarını hariç tut
    if (adminUser) {
      where.userId = { not: adminUser.id };
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

    // Images'ı parse et
    const formattedListings = listings.map(listing => {
      let images: string[] = [];
      try {
        if (typeof listing.images === 'string') {
          images = JSON.parse(listing.images);
        } else if (Array.isArray(listing.images)) {
          images = listing.images;
        }
      } catch {
        images = [];
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
      contactOptions,
      images,
      features,
      condition,
      brand,
      model,
      year,
      isPremium,
      premiumFeatures,
      premiumUntil,
      expiresAt,
    } = body;

    // Validasyon
    if (!title || !description || !price || !category || !location) {
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları doldurun' },
        { status: 400 }
      );
    }

    // Resim zorunlu kontrolü
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'En az bir resim yüklemelisiniz' },
        { status: 400 }
      );
    }

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

    // İlanı oluştur - approvalStatus: 'pending' olarak ayarla
    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: parseFloat(price),
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
        model: model || null,
        year: year || null,
        isPremium: isPremium || false,
        premiumFeatures: premiumFeatures ? JSON.stringify({
          ...(typeof premiumFeatures === 'string' ? JSON.parse(premiumFeatures) : premiumFeatures),
          contactOptions: contactOptions || { showPhone: true, showWhatsApp: true, showMessage: true }
        }) : contactOptions ? JSON.stringify({ contactOptions }) : null,
        premiumUntil: premiumUntil ? new Date(premiumUntil) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün sonra
        views: 0,
        isActive: true,
        approvalStatus: 'pending', // Moderatör/Admin onayına düşer
        userId: user.id,
      },
    });

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

