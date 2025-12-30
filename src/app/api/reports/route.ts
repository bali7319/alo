import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Şikayet oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingId, reason, description } = body;

    // Validasyon
    if (!listingId || !reason) {
      return NextResponse.json(
        { error: 'İlan ID ve şikayet nedeni gereklidir' },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // İlanın var olduğunu kontrol et
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcı kendi ilanını şikayet edemez
    const listingOwner = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { userId: true },
    });

    if (listingOwner?.userId === user.id) {
      return NextResponse.json(
        { error: 'Kendi ilanınızı şikayet edemezsiniz' },
        { status: 400 }
      );
    }

    // Şikayet oluştur
    const report = await prisma.report.create({
      data: {
        listingId,
        reporterId: user.id,
        reason,
        description: description || null,
        status: 'pending',
      },
    });

    return NextResponse.json({
      message: 'Şikayetiniz başarıyla gönderildi. İnceleme sürecine alındı.',
      report: {
        id: report.id,
        status: report.status,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Şikayet oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Şikayet gönderilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Tüm şikayetleri getir (Admin için)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, email: true },
    });

    const isAdmin = user?.role === 'admin' || 
                    user?.email === 'admin@alo17.tr' ||
                    user?.email?.endsWith('@alo17.tr');

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Yetkiniz yok' },
        { status: 403 }
      );
    }

    const reports = await prisma.report.findMany({
      include: {
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Şikayetleri getirme hatası:', error);
    return NextResponse.json(
      { error: 'Şikayetler yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

