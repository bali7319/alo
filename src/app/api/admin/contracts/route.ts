import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { handleApiError } from '@/lib/api-error';
import { Prisma } from '@prisma/client';
import { createContractSchema } from '@/lib/validations/contract';

// GET - Tüm sözleşmeleri listele
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const adminError = await requireAdmin(session);
    if (adminError) return adminError;

    // Contract modelinin var olup olmadığını kontrol et
    try {
      const contracts = await prisma.contract.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json(contracts);
    } catch (dbError: unknown) {
      // Eğer tablo yoksa veya bağlantı hatası varsa boş array döndür
      const errorMessage = dbError instanceof Error ? dbError.message : '';
      const errorCode = dbError && typeof dbError === 'object' && 'code' in dbError ? dbError.code : undefined;
      
      // Prisma hata kodları
      if (
        errorCode === 'P2021' || // Tablo bulunamadı
        errorCode === 'P1001' || // Veritabanı bağlantı hatası
        errorCode === 'P1012' || // DATABASE_URL hatası
        errorMessage.includes('does not exist') || 
        errorMessage.includes('model') ||
        errorMessage.includes('DATABASE_URL') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('connect')
      ) {
        console.warn('Contract tablosu/veritabanı bağlantı sorunu, boş liste döndürülüyor:', errorMessage);
        return NextResponse.json([]);
      }
      throw dbError;
    }
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2021' || error.code === 'P2025') {
        return NextResponse.json([]);
      }
    }
    return handleApiError(error);
  }
}

// POST - Yeni sözleşme oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const adminError = await requireAdmin(session);
    if (adminError) return adminError;

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
  } catch (error) {
    return handleApiError(error);
  }
}

