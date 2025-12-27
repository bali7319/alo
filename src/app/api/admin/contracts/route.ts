import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Tüm sözleşmeleri listele
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Contract modelinin var olup olmadığını kontrol et
    try {
      const contracts = await (prisma as any).contract.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json(contracts);
    } catch (dbError: any) {
      // Eğer tablo yoksa boş array döndür
      if (dbError.message?.includes('does not exist') || dbError.message?.includes('model') || dbError.code === 'P2021') {
        console.warn('Contract tablosu henüz oluşturulmamış, boş liste döndürülüyor');
        return NextResponse.json([]);
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error('Sözleşmeler listeleme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Sözleşmeler yüklenemedi', 
        details: error.message,
        hint: 'Database migration çalıştırıldı mı? (npx prisma migrate dev)'
      },
      { status: 500 }
    );
  }
}

// POST - Yeni sözleşme oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      type,
      content,
      version,
      isActive,
      isRequired,
      language,
      expiresAt,
    } = body;

    // Validasyon
    if (!title || !type || !content || !version || !language) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanlar doldurulmalı' },
        { status: 400 }
      );
    }

    const contract = await (prisma as any).contract.create({
      data: {
        title,
        type,
        content,
        version,
        isActive: isActive ?? true,
        isRequired: isRequired ?? false,
        language,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        publishedAt: isActive ? new Date() : null,
      },
    });

    return NextResponse.json(contract, { status: 201 });
  } catch (error: any) {
    console.error('Sözleşme oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Sözleşme oluşturulamadı', details: error.message },
      { status: 500 }
    );
  }
}

