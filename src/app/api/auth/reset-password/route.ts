import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import crypto from 'crypto';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token gereklidir'),
  email: z.string().email('Geçerli bir email adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email, password } = resetPasswordSchema.parse(body);

    // Email'i küçük harfe çevir
    const normalizedEmail = email.toLowerCase().trim();

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Sosyal medya hesabı kontrolü
    if (!user.password) {
      return NextResponse.json(
        { error: 'Bu hesap için şifre sıfırlama yapılamaz' },
        { status: 400 }
      );
    }

    // Token formatını kontrol et (64 karakter hex)
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş şifre sıfırlama linki' },
        { status: 400 }
      );
    }

    // DB'de token doğrula (hash üzerinden)
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const now = new Date();

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        tokenHash,
        usedAt: null,
        expiresAt: { gt: now },
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş şifre sıfırlama linki' },
        { status: 400 }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await hash(password, 12);

    // Atomik güncelle: şifreyi güncelle + token'ı tüket
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: now },
      }),
    ]);

    return NextResponse.json({
      message: 'Şifreniz başarıyla güncellendi',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Şifre sıfırlama hatası:', error);
    return NextResponse.json(
      { error: 'Şifre sıfırlama işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
