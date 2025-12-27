import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSlug, extractIdFromSlug } from '@/lib/slug';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    if (!slugOrId) {
      return NextResponse.json(
        { error: 'İlan slug veya ID gerekli' },
        { status: 400 }
      );
    }

    // Slug'dan ID çıkarmayı dene
    const possibleId = extractIdFromSlug(slugOrId);
    
    let listing;
    if (possibleId) {
      // Eski ID formatı - direkt ID ile ara
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
    } else {
      // Slug formatı - Çok optimize edilmiş arama: En uzun kelimeyi bul ve title'da ara
      const keywords = slugOrId
        .split('-')
        .filter(word => word.length > 3) // 3 karakterden uzun kelimeleri al (daha spesifik)
        .sort((a, b) => b.length - a.length) // En uzun kelimeyi önce al
        .slice(0, 1); // Sadece en uzun kelimeyi kullan
      
      // En az 1 kelime varsa, title'da bu kelimeyi ara
      if (keywords.length >= 1) {
        const searchTerm = keywords[0]; // En uzun ve en spesifik kelime
        
        const candidates = await withTimeout(
          prisma.listing.findMany({
            where: {
              isActive: true,
              approvalStatus: 'approved',
              title: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
            select: {
              id: true,
              title: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 30, // Son 30 aday (daha agresif limit)
          }),
          3000 // 3 saniye timeout (daha kısa - hızlı başarısızlık)
        );
        
        // Adaylar arasında slug'ı eşleşen ilanı bul
        listing = candidates.find(l => {
          const listingSlug = createSlug(l.title);
          return listingSlug === slugOrId;
        });
      }
      
      // Eğer hala bulunamadıysa, son 30 ilanı çek ve slug ile eşleştir (fallback)
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
            },
            orderBy: { createdAt: 'desc' },
            take: 30, // Son 30 ilan (daha agresif limit)
          }),
          3000 // 3 saniye timeout (daha kısa - hızlı başarısızlık)
        );
        
        listing = recentListings.find(l => {
          const listingSlug = createSlug(l.title);
          return listingSlug === slugOrId;
        });
      }
      
      // Eğer listing bulunduysa, tam detaylarını çek
      if (listing) {
        listing = await withTimeout(
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
      }
    }

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

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

    const premiumFeatures = parseJson(listing.premiumFeatures);

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
      model: listing.model,
      year: listing.year,
      isPremium: listing.isPremium,
      premiumFeatures,
      premiumUntil: listing.premiumUntil?.toISOString(),
      expiresAt: listing.expiresAt.toISOString(),
      views: listing.views,
      isActive: listing.isActive,
      approvalStatus: listing.approvalStatus,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      user: listing.user,
    };

    return NextResponse.json(
      { listing: formattedListing },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('İlan getirme hatası:', error);
    
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
    
    return NextResponse.json(
      { error: 'İlan yüklenirken hata oluştu' },
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
      // Slug formatı - Optimize edilmiş arama (GET ile aynı mantık)
      const keywords = slugOrId
        .split('-')
        .filter(word => word.length > 2)
        .slice(0, 3); // Performans için 3 kelimeye düşürüldü
      
      if (keywords.length >= 1) {
        const searchTerm = keywords.length > 1 ? keywords[1] : keywords[0]; // Daha spesifik kelime
        
        const candidates = await withTimeout(
          prisma.listing.findMany({
            where: {
              isActive: true,
              approvalStatus: 'approved',
              title: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
            select: {
              id: true,
              title: true,
              userId: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 50, // Performans için azaltıldı
          }),
          5000 // Timeout artırıldı
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
            take: 50, // Performans için azaltıldı
          }),
          5000 // Timeout artırıldı
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
    const userRole = (user as any)?.role;
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
    const updateData: any = {
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
      model: body.model || null,
      year: body.year || null,
      images: typeof body.images === 'string' ? body.images : JSON.stringify(imagesArray),
      features: typeof body.features === 'string' ? body.features : JSON.stringify(body.features || []),
      showPhone: body.showPhone !== false,
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
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
        return parsed ? [parsed] : [];
      } catch {
        return typeof val === 'string' ? [val] : [];
      }
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
      model: updatedListing.model,
      year: updatedListing.year,
      isPremium: updatedListing.isPremium,
      premiumUntil: updatedListing.premiumUntil?.toISOString(),
      expiresAt: updatedListing.expiresAt.toISOString(),
      views: updatedListing.views,
      isActive: updatedListing.isActive,
      approvalStatus: updatedListing.approvalStatus,
      createdAt: updatedListing.createdAt.toISOString(),
      updatedAt: updatedListing.updatedAt.toISOString(),
      user: updatedListing.user,
    };

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
      // Slug formatı - Optimize edilmiş arama (GET ile aynı mantık)
      const keywords = slugOrId
        .split('-')
        .filter(word => word.length > 2)
        .slice(0, 3); // Performans için 3 kelimeye düşürüldü
      
      if (keywords.length >= 1) {
        const searchTerm = keywords.length > 1 ? keywords[1] : keywords[0]; // Daha spesifik kelime
        
        const candidates = await withTimeout(
          prisma.listing.findMany({
            where: {
              isActive: true,
              approvalStatus: 'approved',
              title: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
            select: {
              id: true,
              title: true,
              userId: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 50, // Performans için azaltıldı
          }),
          5000 // Timeout artırıldı
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
            take: 50, // Performans için azaltıldı
          }),
          5000 // Timeout artırıldı
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
    try {
      await prisma.listing.delete({
        where: { id: listing.id },
      });
    } catch (deleteError: any) {
      // Eğer ilan zaten silinmişse, başarılı say
      if (deleteError?.code === 'P2025') {
        return NextResponse.json({
          message: 'İlan zaten silinmiş',
        });
      }
      throw deleteError;
    }

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

