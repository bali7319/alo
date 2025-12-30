import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAdminEmail } from '@/lib/admin';

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
    const user = await (prisma.user.findUnique as any)({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkiniz yok. Sadece admin bu işlemi yapabilir.' },
        { status: 403 }
      );
    }

    // Admin kullanıcısını bul (sadece hariç tutmak için)
    const adminUser = await prisma.user.findUnique({
      where: { email: getAdminEmail() },
    });

    // Sadece Demo/örnek/test içeren başlıklara sahip ilanları bul
    // Admin kullanıcısının ilanlarını SİLMEYİZ
    const demoListings = await prisma.listing.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: 'Demo' } },
              { title: { contains: 'Örnek' } },
              { title: { contains: 'Test' } },
              { title: { contains: 'örnek' } },
              { title: { contains: 'demo' } },
              { title: { contains: 'test' } },
              { brand: { contains: 'Demo' } },
              { brand: { contains: 'örnek' } },
              { model: { contains: 'Demo' } },
              { model: { contains: 'örnek' } },
            ],
          },
          // Admin kullanıcısının ilanlarını hariç tut
          ...(adminUser ? [{ userId: { not: adminUser.id } }] : []),
        ],
      },
      select: {
        id: true,
        title: true,
        category: true,
        createdAt: true,
        approvalStatus: true,
        isActive: true,
      },
    });

    // Tekrarları kaldır
    const uniqueIds = Array.from(new Set(demoListings.map(l => l.id)));

    // Tüm ilanları birleştir (tekrarları kaldırarak)
    const uniqueListings = demoListings.filter((l, index, self) => 
      index === self.findIndex(t => t.id === l.id)
    );

    return NextResponse.json({
      found: uniqueListings.length > 0,
      count: uniqueIds.length,
      listings: uniqueListings.map(l => ({
        id: l.id,
        title: l.title,
        category: l.category,
        createdAt: l.createdAt.toISOString(),
        approvalStatus: l.approvalStatus,
        isActive: l.isActive,
      })),
      note: 'Admin kullanıcısının ilanları hariç tutuldu',
      demoListingsCount: demoListings.length,
    });
  } catch (error) {
    console.error('Demo ilan kontrol hatası:', error);
    return NextResponse.json(
      { error: 'Kontrol sırasında bir hata oluştu', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Admin kontrolü
    const user = await (prisma.user.findUnique as any)({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user || (user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkiniz yok. Sadece admin bu işlemi yapabilir.' },
        { status: 403 }
      );
    }

    // Admin kullanıcısını bul (sadece hariç tutmak için)
    const adminUser = await prisma.user.findUnique({
      where: { email: getAdminEmail() },
    });

    // Sadece Demo/örnek/test içeren başlıklara sahip ilanları bul
    // Admin kullanıcısının ilanlarını SİLMEYİZ
    const demoListings = await prisma.listing.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: 'Demo' } },
              { title: { contains: 'Örnek' } },
              { title: { contains: 'Test' } },
              { title: { contains: 'örnek' } },
              { title: { contains: 'demo' } },
              { title: { contains: 'test' } },
              { brand: { contains: 'Demo' } },
              { brand: { contains: 'örnek' } },
              { model: { contains: 'Demo' } },
              { model: { contains: 'örnek' } },
            ],
          },
          // Admin kullanıcısının ilanlarını hariç tut
          ...(adminUser ? [{ userId: { not: adminUser.id } }] : []),
        ],
      },
      select: {
        id: true,
      },
    });

    // Tekrarları kaldır
    const uniqueIds = Array.from(new Set(demoListings.map(l => l.id)));

    if (uniqueIds.length === 0) {
      return NextResponse.json({
        message: 'Silinecek demo/örnek ilan bulunamadı.',
        deleted: 0,
      });
    }

    // 4. İlişkili kayıtları temizle
    // Favorilerden kaldır
    await prisma.userFavorite.deleteMany({
      where: {
        listingId: {
          in: uniqueIds,
        },
      },
    });

    // Mesajlardan listingId'yi null yap
    await prisma.message.updateMany({
      where: {
        listingId: {
          in: uniqueIds,
        },
      },
      data: {
        listingId: null,
      },
    });

    // 5. İlanları sil
    const result = await prisma.listing.deleteMany({
      where: {
        id: {
          in: uniqueIds,
        },
      },
    });

    return NextResponse.json({
      message: `${result.count} demo/örnek ilan başarıyla silindi. (Admin kullanıcısının ilanları hariç tutuldu)`,
      deleted: result.count,
      ids: uniqueIds,
      note: 'Admin kullanıcısının ilanları korundu',
    });
  } catch (error) {
    console.error('Demo ilan silme hatası:', error);
    return NextResponse.json(
      { error: 'Silme işlemi sırasında bir hata oluştu', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

