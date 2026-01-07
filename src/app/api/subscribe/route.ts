import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = subscribeSchema.parse(body);

    // Email'i küçük harfe çevir (unique constraint için)
    const normalizedEmail = email.toLowerCase().trim();

    // Zaten abone mi kontrol et
    const existing = await prisma.emailSubscription.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: 'Bu email adresi zaten abone' },
          { status: 400 }
        );
      } else {
        // Pasif aboneliği aktif et
        await prisma.emailSubscription.update({
          where: { email: normalizedEmail },
          data: { isActive: true },
        });
        return NextResponse.json({ 
          message: 'Aboneliğiniz yeniden aktif edildi',
          subscribed: true 
        });
      }
    }

    // Yeni abonelik oluştur
    await prisma.emailSubscription.create({
      data: {
        email: normalizedEmail,
        isActive: true,
      },
    });

    return NextResponse.json({ 
      message: 'Başarıyla abone oldunuz',
      subscribed: true 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Abonelik oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Abonelik oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

