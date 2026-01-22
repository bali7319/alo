import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAdminEmail } from '@/lib/admin';

// İlanı tekrar yayınla
export async function POST(
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

    const { id } = await params;

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const sessionRole = (session.user as any)?.role;
    const isAdmin = sessionRole === 'admin' || user.role === 'admin' || isAdminEmail(session.user.email);

    // İlanı bul
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    // İlanın kullanıcıya ait olduğunu kontrol et (admin hariç)
    if (!isAdmin && listing.userId !== user.id) {
      return NextResponse.json(
        { error: 'Bu ilan size ait değil' },
        { status: 403 }
      );
    }

    // Süresi dolmuş mu kontrol et
    const now = new Date();
    const expiresAt = new Date(listing.expiresAt);
    const daysSinceExpiry = Math.floor((now.getTime() - expiresAt.getTime()) / (1000 * 60 * 60 * 24));

    // Admin yenilemesi: sadece süresi dolmuş ilanları yenile (7 gün limitini bypass eder)
    if (isAdmin) {
      if (expiresAt > now) {
        return NextResponse.json(
          { error: 'Bu ilan henüz süresi dolmamış. Yenileme gerekmiyor.' },
          { status: 400 }
        );
      }
    } else {
      // Normal kullanıcı: 7 günden fazla geçmişse tekrar yayınlanamaz
      if (daysSinceExpiry > 7) {
        return NextResponse.json(
          { error: 'İlan süresi 7 günden fazla önce dolmuş. Tekrar yayınlanamaz.' },
          { status: 400 }
        );
      }
    }

    // Süresi dolmamış ilanlar için (normal kullanıcı)
    if (!isAdmin && expiresAt > now) {
      return NextResponse.json(
        { error: 'Bu ilan henüz süresi dolmamış. Yenileme gerekmiyor.' },
        { status: 400 }
      );
    }

    // İlanı tekrar aktif yap ve süresini uzat (30 gün)
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        isActive: true,
        expiresAt: newExpiresAt,
        approvalStatus: 'pending' // Tekrar moderatör onayına gönder
      },
    });

    return NextResponse.json({
      success: true,
      message: 'İlan tekrar yayınlandı ve moderatör onayına gönderildi',
      listing: {
        id: updatedListing.id,
        isActive: updatedListing.isActive,
        expiresAt: updatedListing.expiresAt.toISOString(),
        approvalStatus: updatedListing.approvalStatus
      }
    });
  } catch (error) {
    console.error('İlan yenileme hatası:', error);
    return NextResponse.json(
      { error: 'İlan yenilenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

