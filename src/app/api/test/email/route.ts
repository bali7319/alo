import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Admin kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { to, subject, message } = body;

    if (!to || !subject) {
      return NextResponse.json(
        { error: 'Email adresi ve konu gereklidir' },
        { status: 400 }
      );
    }

    // Test email gönder
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .test-badge { background: #10b981; color: white; padding: 5px 10px; border-radius: 3px; display: inline-block; margin-bottom: 15px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📧 Email Test Mesajı</h2>
          </div>
          <div class="content">
            <div class="test-badge">TEST EMAİL</div>
            <p>Bu bir test email'idir. Email gönderme sistemi çalışıyor! ✅</p>
            ${message ? `<p><strong>Özel Mesaj:</strong> ${message}</p>` : ''}
            <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
              Bu email Alo17 email test sistemi tarafından gönderilmiştir.
            </p>
          </div>
          <div class="footer">
            <p>Alo17 İlan Yönetim Sistemi</p>
            <p>${new Date().toLocaleString('tr-TR')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Email Test Mesajı

Bu bir test email'idir. Email gönderme sistemi çalışıyor! ✅

${message ? `Özel Mesaj: ${message}` : ''}

Bu email Alo17 email test sistemi tarafından gönderilmiştir.
${new Date().toLocaleString('tr-TR')}
    `;

    const success = await sendEmail({
      to,
      subject: `[TEST] ${subject}`,
      html,
      text,
    });

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Test email başarıyla gönderildi',
        to,
        subject: `[TEST] ${subject}`,
      });
    } else {
      return NextResponse.json(
        { error: 'Email gönderilemedi. Lütfen EMAIL_FROM/RESEND_API_KEY veya SMTP ayarlarını kontrol edin.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Email test hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Email gönderme sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
