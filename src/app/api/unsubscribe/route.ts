import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const unsubscribeSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = unsubscribeSchema.parse(body);

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.emailSubscription.findUnique({
      where: { email: normalizedEmail },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi listede bulunamadı.' },
        { status: 404 }
      );
    }

    if (!existing.isActive) {
      return NextResponse.json({
        message: 'Aboneliğiniz zaten iptal edilmiş.',
        unsubscribed: true,
      });
    }

    await prisma.emailSubscription.update({
      where: { email: normalizedEmail },
      data: { isActive: false },
    });

    return NextResponse.json({
      message: 'Aboneliğiniz başarıyla iptal edildi.',
      unsubscribed: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Abonelik iptal hatası:', error);
    return NextResponse.json(
      { error: 'İşlem sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
}
