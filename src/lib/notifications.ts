/**
 * Notification servisi
 * Admin ve kullanıcılara bildirim gönderme
 */

import { prisma } from '@/lib/prisma';
import { getAdminEmail } from './admin';

/**
 * Admin'e yeni ilan bildirimi oluştur
 */
export async function createAdminNotificationForNewListing(listing: {
  id: string;
  title: string;
  user: { name: string; email: string };
  category: string;
  price: number;
}): Promise<void> {
  try {
    // Admin kullanıcısını bul
    const adminUser = await prisma.user.findUnique({
      where: { email: getAdminEmail() },
      select: { id: true },
    });

    if (!adminUser) {
      console.warn('Admin kullanıcı bulunamadı, notification oluşturulamadı');
      return;
    }

    // Notification oluştur
    await prisma.notification.create({
      data: {
        userId: adminUser.id,
        title: 'Yeni İlan Onay Bekliyor',
        message: `${listing.user.name} kullanıcısı "${listing.title}" başlıklı yeni bir ilan oluşturdu. İlan onayınızı bekliyor.`,
        type: 'system',
        isRead: false,
      },
    });
  } catch (error) {
    console.error('Admin notification oluşturma hatası:', error);
    // Hata olsa bile devam et, kritik değil
  }
}

/**
 * Kullanıcıya notification oluştur
 */
export async function createUserNotification(
  userId: string,
  title: string,
  message: string,
  type: string = 'system'
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        isRead: false,
      },
    });
  } catch (error) {
    console.error('User notification oluşturma hatası:', error);
  }
}

/**
 * Kullanıcının okunmamış notification sayısını getir
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  } catch (error) {
    console.error('Notification sayısı alma hatası:', error);
    return 0;
  }
}

