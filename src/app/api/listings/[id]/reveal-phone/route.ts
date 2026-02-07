import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { decryptPhone } from '@/lib/encryption';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { extractIdFromSlug } from '@/lib/slug';
import { handleApiError } from '@/lib/api-error';

// Telefon "reveal" endpoint'i:
// - Listing detail API'de telefonu public dönmüyoruz.
// - Telefonu sadece kullanıcı aksiyonuyla (POST) döndürüyoruz.
// - Scraper'ları azaltmak için daha sıkı rate-limit.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: slugOrId } = await params;
    if (!slugOrId) {
      return NextResponse.json({ error: 'İlan ID gerekli' }, { status: 400 });
    }

    // Basit bot sinyali (hard-block değil): cross-site POST'ları engelle.
    // Not: Referer boş olabilir (mobil/webview), o yüzden referer zorunlu değil.
    const secFetchSite = request.headers.get('sec-fetch-site');
    if (secFetchSite && secFetchSite !== 'same-origin' && secFetchSite !== 'same-site') {
      return NextResponse.json({ error: 'Geçersiz istek' }, { status: 403 });
    }

    // Rate limit (IP bazlı)
    const ip = getClientIP(request);
    const key = `reveal-phone:${ip}`;
    const rl = checkRateLimit(key, 30, 60_000); // 30 istek / dk
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.' },
        { status: 429 }
      );
    }

    // Slug ise ID çıkar, değilse direkt ID olarak kabul et.
    const possibleId = extractIdFromSlug(slugOrId);
    const listingId = possibleId || slugOrId;

    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email || null;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        isActive: true,
        approvalStatus: true,
        showPhone: true,
        phone: true,
        userId: true,
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'İlan bulunamadı' }, { status: 404 });
    }

    // Admin/owner kontrolü: inactive/pending listing'lerde telefonu sadece admin/owner görebilsin.
    let isOwnerOrAdmin = false;
    if (sessionEmail) {
      const { isAdminEmail } = await import('@/lib/admin');
      const sessionUser = await prisma.user
        .findUnique({ where: { email: sessionEmail }, select: { id: true, role: true } })
        .catch(() => null);

      const isAdmin =
        ((session?.user as any)?.role === 'admin') ||
        sessionUser?.role === 'admin' ||
        isAdminEmail(sessionEmail);
      const isOwner = sessionUser?.id ? listing.userId === sessionUser.id : listing.user.email === sessionEmail;
      isOwnerOrAdmin = isAdmin || isOwner;
    }

    // Public listing değilse: sadece owner/admin
    const isPublicListing = listing.isActive && listing.approvalStatus === 'approved';
    if (!isPublicListing && !isOwnerOrAdmin) {
      return NextResponse.json({ error: 'İlan bulunamadı' }, { status: 404 });
    }

    if (listing.showPhone === false) {
      return NextResponse.json({ error: 'Telefon bilgisi gizli' }, { status: 403 });
    }

    // Telefon seçimi: listing.phone öncelikli, yoksa user.phone
    let phone = (listing.phone || listing.user.phone || '').trim();
    if (!phone) {
      return NextResponse.json({ error: 'Telefon bilgisi bulunamadı' }, { status: 404 });
    }

    // Şifreli ise çöz
    if (phone.includes(':') && phone.split(':').length === 3) {
      try {
        const decrypted = decryptPhone(phone);
        phone = decrypted ? decrypted.trim() : '';
      } catch {
        phone = '';
      }
    }

    if (!phone) {
      return NextResponse.json({ error: 'Telefon bilgisi bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(
      { phone },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-RateLimit-Remaining': String(rl.remaining),
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

