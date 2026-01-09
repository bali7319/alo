import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Kullanıcının bildirimlerini getir
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

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

    // Bildirimleri getir (en yeni önce)
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Son 50 bildirim
    });

    // Okunmamış bildirim sayısı
    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    return NextResponse.json({
      notifications: notifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    });
  } catch (error) {
    console.error('Bildirim getirme hatası:', error);
    
    // Prisma bağlantı hatası kontrolü
    if (error instanceof Error && error.message.includes('Prisma')) {
      console.error('Prisma bağlantı hatası:', error);
      return NextResponse.json(
        { error: 'Veritabanı bağlantı hatası', notifications: [], unreadCount: 0 },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Bildirimler yüklenirken bir hata oluştu', notifications: [], unreadCount: 0 },
      { status: 500 }
    );
  }
}

// Bildirimi okundu olarak işaretle
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

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

    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      // Tüm bildirimleri okundu olarak işaretle
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      });
    } else if (notificationId) {
      // Tek bir bildirimi okundu olarak işaretle
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bildirim güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Bildirim güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

