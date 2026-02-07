import type { Session } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Admin Utility Functions
 * Admin kullanıcı ile ilgili merkezi fonksiyonlar
 */

/**
 * Admin email adresini döndürür
 * Environment variable'dan alır, yoksa default değer kullanır
 */
export function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL || 'admin@alo17.tr';
}

/**
 * Verilen email'in admin email'i olup olmadığını kontrol eder
 * Hem environment variable'dan gelen email'i hem de genel admin pattern'lerini kontrol eder
 */
export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  
  // Önce environment variable'dan gelen email'i kontrol et
  if (email === getAdminEmail()) {
    return true;
  }
  
  // Genel admin email pattern'leri (backward compatibility)
  return email === 'admin@alo17.tr' ||
         email === 'admin@alo17.com' ||
         email === 'destek@alo17.tr' ||
         email === 'destek@alo17.com' ||
         email.endsWith('@alo17.com') ||
         email.endsWith('@alo17.tr');
}

/**
 * Session'ın admin yetkisine sahip olup olmadığını kontrol eder.
 * Admin değilse uygun 401/403 NextResponse döner, admin ise null (devam edilebilir).
 * API route'larda: const err = await requireAdmin(session); if (err) return err;
 */
export async function requireAdmin(session: Session | null): Promise<NextResponse | null> {
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Oturum açmanız gerekiyor' },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, email: true },
  });

  const admin =
    user?.role === 'admin' ||
    (user?.email != null && isAdminEmail(user.email)) ||
    user?.email?.endsWith('@alo17.tr');

  if (!admin) {
    return NextResponse.json(
      { error: 'Yetkiniz yok' },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Session'ın moderator veya admin yetkisine sahip olup olmadığını kontrol eder.
 * Yetkili ise { user: { id, role } } döner (moderator ilan işlemlerinde user.id kullanılır).
 * Yetkisiz ise 401/403 NextResponse döner.
 * Kullanım: const auth = await requireModeratorOrAdmin(session); if (auth instanceof NextResponse) return auth; const { user } = auth;
 */
export async function requireModeratorOrAdmin(
  session: Session | null
): Promise<NextResponse | { user: { id: string; role: string } }> {
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Oturum açmanız gerekiyor' },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, email: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'Kullanıcı bulunamadı' },
      { status: 401 }
    );
  }

  const allowed =
    user.role === 'admin' ||
    user.role === 'moderator' ||
    (user.email != null && isAdminEmail(user.email)) ||
    user.email?.endsWith('@alo17.tr');

  if (!allowed) {
    return NextResponse.json(
      { error: 'Yetkiniz yok. Sadece admin ve moderatörler erişebilir.' },
      { status: 403 }
    );
  }

  return { user: { id: user.id, role: user.role } };
}

