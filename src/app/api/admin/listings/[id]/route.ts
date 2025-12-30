import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Admin için ilan detayı getir
export async function GET(
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

    // Admin kontrolü
    if (session.user.email !== 'admin@alo17.tr') {
      return NextResponse.json(
        { error: 'Yetkiniz yok' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('Admin ilan getirme hatası:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'İlan yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
  // NOT: $disconnect() çağrısını kaldırdık - Prisma connection pool otomatik yönetir
}

// Admin için ilan işlemleri (onaylama, reddetme, silme, premium yapma)
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

    // Admin kontrolü
    if (session.user.email !== 'admin@alo17.tr') {
      return NextResponse.json(
        { error: 'Yetkiniz yok' },
        { status: 403 }
      );
    }

    // Admin kullanıcıyı bul
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action, days } = body;

    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    // Tüm işlemlerde moderator bilgilerini kaydet
    let updateData: any = {
      moderatorId: adminUser.id,
      moderatedAt: new Date(),
    };

    switch (action) {
      case 'approve':
        // Eğer expiresAt geçmiş bir tarihse, yeni bir bitiş tarihi ayarla (30 gün sonra)
        const now = new Date();
        const expiresAt = listing.expiresAt < now 
          ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 gün sonra
          : listing.expiresAt;
        
        updateData = {
          ...updateData,
          approvalStatus: 'approved',
          isActive: true,
          expiresAt: expiresAt,
        };
        break;
      
      case 'reject':
        updateData = {
          ...updateData,
          approvalStatus: 'rejected',
          isActive: false,
        };
        break;
      
      case 'premium':
        const premiumDays = days || 30;
        const premiumUntil = new Date();
        premiumUntil.setDate(premiumUntil.getDate() + premiumDays);
        updateData = {
          ...updateData,
          isPremium: true,
          premiumUntil,
        };
        break;
      
      case 'unpremium':
        updateData = {
          ...updateData,
          isPremium: false,
          premiumUntil: null,
        };
        break;
      
      case 'activate':
        updateData = {
          ...updateData,
          isActive: true,
        };
        break;
      
      case 'deactivate':
        updateData = {
          ...updateData,
          isActive: false,
        };
        break;
      
      default:
        return NextResponse.json(
          { error: 'Geçersiz işlem' },
          { status: 400 }
        );
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: updateData,
    });

    const response = NextResponse.json({
      message: 'İşlem başarılı',
      listing: updatedListing,
    });
    
    return response;
  } catch (error) {
    console.error('Admin ilan işlem hatası:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'İşlem sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
  // NOT: $disconnect() çağrısını kaldırdık - Prisma connection pool otomatik yönetir
}

// Admin için ilan silme
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

    // Admin kontrolü
    if (session.user.email !== 'admin@alo17.tr') {
      return NextResponse.json(
        { error: 'Yetkiniz yok' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Önce ilanın var olup olmadığını kontrol et
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    // İlişkili kayıtları temizle (cascade delete zaten var ama manuel de temizleyebiliriz)
    try {
      // Favorilerden kaldır (eğer varsa)
      await prisma.userFavorite.deleteMany({
        where: { listingId: id },
      }).catch(() => {}); // Hata olursa devam et

      // Mesajları güncelle (listingId null yapılacak çünkü onDelete: SetNull)
      await prisma.message.updateMany({
        where: { listingId: id },
        data: { listingId: null },
      }).catch(() => {}); // Hata olursa devam et
    } catch (cleanupError) {
      // Temizleme hatası önemli değil, devam et
      console.warn('İlişkili kayıtlar temizlenirken hata:', cleanupError);
    }

    // İlanı sil (schema'da onDelete: Cascade olduğu için otomatik temizlenmeli)
    try {
      await prisma.listing.delete({
        where: { id },
      });
    } catch (deleteError: any) {
      // Eğer ilan zaten silinmişse, başarılı say
      if (deleteError?.code === 'P2025') {
        return NextResponse.json({
          message: 'İlan zaten silinmiş',
        });
      }
      throw deleteError; // Diğer hataları yukarı fırlat
    }

    return NextResponse.json({
      message: 'İlan başarıyla silindi',
    });
  } catch (error) {
    console.error('Admin ilan silme hatası:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'İlan silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
  // NOT: $disconnect() çağrısını kaldırdık - Prisma connection pool otomatik yönetir
}

