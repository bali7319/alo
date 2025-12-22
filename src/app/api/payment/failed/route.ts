import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { merchant_oid, failed_reason_msg } = body;

    if (!merchant_oid) {
      return NextResponse.json(
        { error: 'Merchant OID gerekli' },
        { status: 400 }
      );
    }

    // Ödeme kaydını logla (gerçek uygulamada Payment tablosu olabilir)
    console.log('Ödeme başarısız:', {
      merchant_oid,
      failed_reason_msg,
      userId: session.user.email,
      timestamp: new Date().toISOString(),
    });

    // Burada ödeme kaydını veritabanına kaydedebilirsiniz
    // Örnek: await prisma.payment.create({ ... });

    return NextResponse.json(
      { message: 'Ödeme başarısız kaydı oluşturuldu' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ödeme başarısız kayıt hatası:', error);
    return NextResponse.json(
      { error: 'Kayıt oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

