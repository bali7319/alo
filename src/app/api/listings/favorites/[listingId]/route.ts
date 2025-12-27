import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// İlanı favorilerden çıkar
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { listingId } = await params;

    if (!listingId) {
      return NextResponse.json(
        { error: 'İlan ID\'si gerekli' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Favori kaydını bul ve sil
    const favorite = await prisma.userFavorite.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId: listingId,
        },
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: 'Bu ilan favorilerinizde bulunamadı' },
        { status: 404 }
      );
    }

    await prisma.userFavorite.delete({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId: listingId,
        },
      },
    });

    return NextResponse.json({ 
      message: 'İlan favorilerden çıkarıldı',
      success: true 
    });
  } catch (error) {
    console.error('Favori silme hatası:', error);
    return NextResponse.json(
      { error: 'Favori silinirken hata oluştu' },
      { status: 500 }
    );
  }
} 