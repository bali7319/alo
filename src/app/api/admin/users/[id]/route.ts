import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Kullanıcı rolünü güncelle (moderator atama/kaldırma)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sadece admin rol değiştirebilir
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser || adminUser.email !== 'admin@alo17.tr') {
      return NextResponse.json(
        { error: 'Yetkiniz yok. Sadece admin kullanıcı rolleri değiştirebilir.' },
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { role } = body; // "user", "moderator", "admin"

    // Geçerli roller
    const validRoles = ['user', 'moderator', 'admin'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Geçersiz rol. Geçerli roller: user, moderator, admin' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Admin kendisinin rolünü değiştiremez
    if (id === adminUser.id && role !== 'admin') {
      return NextResponse.json(
        { error: 'Kendi rolünüzü değiştiremezsiniz' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Rolü güncelle
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: role as any },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        role: true as any,
        createdAt: true,
        _count: {
          select: {
            listings: true,
            sentMessages: true,
            receivedMessages: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Kullanıcı rolü başarıyla güncellendi',
      user: {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
      },
    }, { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Kullanıcı rol güncelleme hatası:', error);
    
    return NextResponse.json(
      {
        error: 'Kullanıcı rolü güncellenirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
  // NOT: $disconnect() çağrısını kaldırdık - Prisma connection pool otomatik yönetir
}

