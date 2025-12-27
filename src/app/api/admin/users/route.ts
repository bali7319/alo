import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Admin için kullanıcıları getir (sayfalama ile)
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
    if (session.user.email !== 'admin@alo17.tr') {
      return NextResponse.json(
        { error: 'Yetkiniz yok' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search'); // Arama terimi

    const skip = (page - 1) * limit;

    // Filtre oluştur
    const where: any = {};
    if (search) {
      // SQLite için case-insensitive arama (mode: 'insensitive' desteklenmiyor)
      const searchLower = search.toLowerCase();
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    // Toplam kayıt sayısı
    const total = await prisma.user.count({ where });

    // Kullanıcıları getir (ilan ve mesaj sayıları ile)
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        role: true,
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

    // Date object'lerini ISO string'e çevir ve role field'ını güvenli hale getir
    const formattedUsers = users.map(user => ({
      ...user,
      role: user.role || 'user', // Varsayılan olarak 'user' kullan
      createdAt: user.createdAt.toISOString(),
    }));

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Admin kullanıcı getirme hatası:', error);
    
    // Error object'i güvenli şekilde serialize et
    const errorMessage = error instanceof Error ? error.message : 'Kullanıcılar yüklenirken hata oluştu';
    const errorName = error instanceof Error ? error.name : 'Error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Prisma hatası kontrolü
    if (errorMessage.includes('Unknown column') || errorMessage.includes('no such column')) {
      return NextResponse.json(
        {
          error: 'Veritabanı şeması güncel değil. Lütfen migration çalıştırın: npx prisma migrate dev',
          message: errorMessage,
          type: errorName
        },
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    return NextResponse.json(
      {
        error: 'Kullanıcılar yüklenirken hata oluştu',
        message: errorMessage,
        type: errorName,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
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

