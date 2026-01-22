import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const forgotPasswordSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Email'i küçük harfe çevir
    const normalizedEmail = email.toLowerCase().trim();

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    console.log('🔍 Şifre sıfırlama isteği:', {
      email: normalizedEmail,
      userFound: !!user,
      hasPassword: !!user?.password,
    });

    // Güvenlik: Kullanıcı var mı yok mu bilgisini verme
    // Her zaman başarılı mesajı döndür (email enumeration saldırılarını önlemek için)
    if (!user) {
      console.log('⚠️ Kullanıcı bulunamadı:', normalizedEmail);
      // Kullanıcı yoksa bile başarılı mesajı döndür (güvenlik)
      return NextResponse.json({
        message: 'Eğer bu email adresi kayıtlıysa, şifre sıfırlama linki gönderildi',
      });
    }

    // Sosyal medya hesabı kontrolü (şifre yoksa)
    if (!user.password) {
      console.log('⚠️ Kullanıcının şifresi yok (sosyal medya hesabı):', normalizedEmail);
      return NextResponse.json({
        message: 'Eğer bu email adresi kayıtlıysa, şifre sıfırlama linki gönderildi',
      });
    }

    // Şifre sıfırlama token'ı oluştur
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 saat geçerli

    // Token'ı DB'de sakla (tek kullanımlık). Eski token'ları temizle.
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: resetTokenExpiry,
      },
    });

    console.log('✅ Şifre sıfırlama token oluşturuldu (hash kaydedildi):', {
      email: normalizedEmail,
      tokenHashPrefix: tokenHash.substring(0, 10) + '...',
      expiresAt: resetTokenExpiry,
    });

    // Email gönderme
    const { sendEmail } = await import('@/lib/email');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alo17.tr';
    const resetUrl = `${siteUrl}/sifre-sifirla?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;

    console.log('📧 Şifre sıfırlama emaili gönderiliyor:', {
      to: normalizedEmail,
      resetUrl: resetUrl.substring(0, 50) + '...',
    });

    try {
      const emailSent = await sendEmail({
        to: normalizedEmail,
        subject: 'Şifre Sıfırlama - Alo17',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
            .warning { background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🔐 Şifre Sıfırlama</h2>
            </div>
            <div class="content">
              <p>Merhaba,</p>
              <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
              
              <a href="${resetUrl}" class="button">
                Şifremi Sıfırla
              </a>
              
              <p>Veya bu linki tarayıcınıza yapıştırın:</p>
              <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
              
              <div class="warning">
                <p><strong>⚠️ Güvenlik Uyarısı:</strong></p>
                <p>Bu link 1 saat geçerlidir. Eğer şifre sıfırlama talebinde bulunmadıysanız, bu email'i görmezden gelebilirsiniz.</p>
              </div>
            </div>
            <div class="footer">
              <p>Alo17 - Çanakkale'nin En Büyük İlan Sitesi</p>
              <p>${siteUrl}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Şifre Sıfırlama

Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:
${resetUrl}

Bu link 1 saat geçerlidir.

Eğer şifre sıfırlama talebinde bulunmadıysanız, bu email'i görmezden gelebilirsiniz.
      `,
      });

      if (!emailSent) {
        console.error('❌ Şifre sıfırlama emaili gönderilemedi:', normalizedEmail);
        // Email gönderilemese bile güvenlik için başarılı mesajı döndür
      } else {
        console.log('✅ Şifre sıfırlama emaili gönderildi:', normalizedEmail);
      }
    } catch (emailError: any) {
      console.error('❌ Email gönderme hatası:', {
        email: normalizedEmail,
        error: emailError.message,
        stack: emailError.stack,
      });
      // Email gönderme hatası olsa bile güvenlik için başarılı mesajı döndür
    }

    return NextResponse.json({
      message: 'Eğer bu email adresi kayıtlıysa, şifre sıfırlama linki gönderildi',
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

