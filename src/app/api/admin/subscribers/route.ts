import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { handleApiError } from '@/lib/api-error';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const adminError = await requireAdmin(session);
    if (adminError) return adminError;

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
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const adminError = await requireAdmin(session);
    if (adminError) return adminError;

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
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const adminError = await requireAdmin(session);
    if (adminError) return adminError;

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
    return handleApiError(error);
  }
}
