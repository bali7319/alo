import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all'; // all, active, inactive

    const skip = (page - 1) * limit;

    // Filtre oluştur
    const where: any = {};
    
    if (search) {
      // SQLite için case-insensitive search
      where.email = {
        contains: search.toLowerCase(),
      };
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    // Toplam sayı
    const total = await prisma.emailSubscription.count({ where });

    // Aboneleri getir
    const subscribers = await prisma.emailSubscription.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      subscribers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Aboneler getirme hatası:', error);
    return NextResponse.json(
      { error: 'Aboneler getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID gerekli' },
        { status: 400 }
      );
    }

    await prisma.emailSubscription.delete({
      where: { id },
    });

    return NextResponse.json({ 
      message: 'Abonelik başarıyla silindi' 
    });
  } catch (error) {
    console.error('Abonelik silme hatası:', error);
    return NextResponse.json(
      { error: 'Abonelik silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, isActive } = body;

    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'ID ve isActive gerekli' },
        { status: 400 }
      );
    }

    const subscriber = await prisma.emailSubscription.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ 
      message: `Abonelik ${isActive ? 'aktif' : 'pasif'} edildi`,
      subscriber 
    });
  } catch (error) {
    console.error('Abonelik güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Abonelik güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
