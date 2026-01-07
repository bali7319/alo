import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { createContractSchema } from '@/lib/validations/contract';

// GET - Tüm sözleşmeleri listele
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const userRole = session?.user?.role;
    if (!session || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Contract modelinin var olup olmadığını kontrol et
    try {
      const contracts = await prisma.contract.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json(contracts);
    } catch (dbError: unknown) {
      // Eğer tablo yoksa boş array döndür
      const errorMessage = dbError instanceof Error ? dbError.message : '';
      const errorCode = dbError && typeof dbError === 'object' && 'code' in dbError ? dbError.code : undefined;
      if (errorMessage.includes('does not exist') || errorMessage.includes('model') || errorCode === 'P2021') {
        console.warn('Contract tablosu henüz oluşturulmamış, boş liste döndürülüyor');
        return NextResponse.json([]);
      }
      throw dbError;
    }
  } catch (error: unknown) {
    console.error('Sözleşmeler listeleme hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json(
      { 
        error: 'Sözleşmeler yüklenemedi', 
        details: errorMessage,
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

    const userRole = session?.user?.role;
    if (!session || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Zod validation
    const validationResult = createContractSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validasyon hatası',
          details: validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const {
      title,
      type,
      content,
      version,
      isActive,
      isRequired,
      language,
      expiresAt,
    } = validationResult.data;

    const contract = await prisma.contract.create({
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

