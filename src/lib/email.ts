/**
 * Email gönderme servisi
 * - SMTP (Nodemailer)
 * - SMTP yoksa: simülasyon (console.log)
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export type SendEmailResult = { success: true } | { success: false; error: string };

export type SmtpRuntimeSettings = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: boolean;
  rejectUnauthorized: boolean;
  ignoreTLS: boolean;
  requireTLS: boolean;
};

export function getSmtpSettings(): SmtpRuntimeSettings | null {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || smtpUser || 'noreply@alo17.tr';

  if (!smtpHost || !smtpUser || !smtpPass) return null;

  const port = parseInt(smtpPort || '587');
  const secure =
    process.env.SMTP_SECURE === 'true'
      ? true
      : process.env.SMTP_SECURE === 'false'
        ? false
        : port === 465;

  const rejectUnauthorized = process.env.SMTP_REJECT_UNAUTHORIZED !== 'false';
  const ignoreTLS = process.env.SMTP_IGNORE_TLS === 'true';
  const requireTLS = process.env.SMTP_REQUIRE_TLS === 'true';

  return {
    host: smtpHost,
    port,
    user: smtpUser,
    pass: smtpPass,
    from: smtpFrom,
    secure,
    rejectUnauthorized,
    ignoreTLS,
    requireTLS,
  };
}

export async function createSmtpTransporter() {
  const settings = getSmtpSettings();
  if (!settings) return null;

  const nodemailer = await import('nodemailer');

  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: { user: settings.user, pass: settings.pass },
    // If provider says "No Encryption", set SMTP_IGNORE_TLS=true to disable STARTTLS upgrades.
    ignoreTLS: settings.ignoreTLS,
    // If provider requires STARTTLS, set SMTP_REQUIRE_TLS=true.
    requireTLS: settings.requireTLS,
    tls: {
      rejectUnauthorized: settings.rejectUnauthorized,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    pool: false,
    maxConnections: 1,
    authMethod: process.env.SMTP_AUTH_METHOD || 'PLAIN',
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development',
  } as any);

  return { transporter, settings };
}

async function sendEmailViaSmtp(options: EmailOptions): Promise<SendEmailResult> {
  const smtp = await createSmtpTransporter();
  if (!smtp) {
    console.log('📧 [SMTP] SMTP ayarları yok; gönderim atlandı.');
    return { success: false, error: 'SMTP ayarları eksik (SMTP_HOST/SMTP_USER/SMTP_PASS)' };
  }

  const { transporter, settings } = smtp;

  // From adresi MUTLAKA SMTP_USER ile aynı olmalı (relay hatası önlemek için)
  // SMTP_FROM varsa ve SMTP_USER ile farklıysa, SMTP_USER kullan (güvenlik)
  const fromAddress = settings.user; // Her zaman SMTP_USER kullan (relay hatası önlemek için)

  console.log('📧 [SMTP] Email gönderiliyor:', {
    from: fromAddress,
    to: options.to,
    subject: options.subject,
    smtpHost: settings.host,
    smtpUser: settings.user,
    smtpFrom: settings.from,
    port: settings.port,
    secure: settings.secure,
    ignoreTLS: settings.ignoreTLS,
    requireTLS: settings.requireTLS,
    rejectUnauthorized: settings.rejectUnauthorized,
  });

  // SMTP bağlantısını test et
  try {
    await transporter.verify();
    console.log('✅ [SMTP] bağlantı başarılı:', { host: settings.host, port: settings.port, user: settings.user });
  } catch (verifyError: any) {
    console.error('❌ [SMTP] bağlantı hatası:', {
      host: settings.host,
      port: settings.port,
      user: settings.user,
      error: verifyError.message,
      code: verifyError.code,
    });
    return { success: false, error: verifyError.message || 'SMTP bağlantı/doğrulama hatası' };
  }

  let info;
  try {
    info = await transporter.sendMail({
      from: fromAddress, // SMTP_USER ile aynı kullan (display name olmadan, sadece email)
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // HTML'den text çıkar
    });
  } catch (sendError: any) {
    console.error('❌ [SMTP] sendMail hatası:', sendError?.message, sendError?.code);
    return { success: false, error: sendError?.message || 'Email gönderilemedi' };
  }

  console.log('📧 [SMTP] Email başarıyla gönderildi:', {
    from: fromAddress,
    to: options.to,
    subject: options.subject,
    messageId: info.messageId,
    response: info.response,
    accepted: info.accepted,
    rejected: info.rejected,
  });

  // Eğer email reddedildiyse uyar
  if (info.rejected && info.rejected.length > 0) {
    console.error('⚠️ [SMTP] Email reddedildi:', {
      to: options.to,
      rejected: info.rejected,
      response: info.response,
    });
    return { success: false, error: `Alıcı reddetti: ${info.response || info.rejected?.join(', ')}` };
  }

  return { success: true };
}

export async function sendEmail(options: EmailOptions): Promise<SendEmailResult> {
  try {
    // Prefer HTTPS relay providers if configured (works even when SMTP ports are blocked)
    const sendgridKey = process.env.SENDGRID_API_KEY;
    if (sendgridKey) {
      const fromEmail = process.env.SENDGRID_FROM || process.env.SMTP_USER || process.env.SUPPORT_EMAIL || 'destek@alo17.tr';
      const fromName = process.env.SENDGRID_FROM_NAME || 'Alo17';
      const text = options.text || options.html.replace(/<[^>]*>/g, '');

      const payload: any = {
        personalizations: [{ to: [{ email: options.to }] }],
        from: { email: fromEmail, name: fromName },
        subject: options.subject,
        content: [
          { type: 'text/plain', value: text },
          { type: 'text/html', value: options.html },
        ],
      };

      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sendgridKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 202) {
        console.log('✅ [SENDGRID] Email accepted:', { to: options.to, subject: options.subject });
        return { success: true };
      }

      let errBody: any = null;
      try {
        errBody = await res.json();
      } catch {
        // ignore
      }
      const errMsg = errBody?.errors?.[0]?.message || `HTTP ${res.status}`;
      console.error('❌ [SENDGRID] Email send failed:', {
        status: res.status,
        to: options.to,
        subject: options.subject,
        errors: errBody?.errors,
      });
      return { success: false, error: errMsg };
    }

    const hasSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    if (!hasSmtp) {
      console.log('📧 [EMAIL SIMULATION] Email gönderiliyor:', {
        to: options.to,
        subject: options.subject,
        note: 'SMTP ayarları yapılandırılmamış, email simüle ediliyor',
      });
      return { success: true };
    }

    return await sendEmailViaSmtp(options);
  } catch (error: any) {
    console.error('❌ Email gönderme hatası:', {
      to: options.to,
      subject: options.subject,
      error: error.message,
      code: error.code,
      stack: error.stack,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    return { success: false, error: error?.message || 'Email gönderme hatası' };
  }
}

/**
 * Admin'e yeni ilan bildirimi gönder
 */
export async function notifyAdminNewListing(listing: {
  id: string;
  title: string;
  user: { name: string; email: string };
  category: string;
  price: number;
}): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@alo17.tr';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alo17.tr';
  
  const subject = `🆕 Yeni İlan Onay Bekliyor: ${listing.title}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .info { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🆕 Yeni İlan Onay Bekliyor</h2>
        </div>
        <div class="content">
          <p>Yeni bir ilan onayınızı bekliyor:</p>
          
          <div class="info">
            <strong>İlan Başlığı:</strong> ${listing.title}<br>
            <strong>Kategori:</strong> ${listing.category}<br>
            <strong>Fiyat:</strong> ${listing.price.toLocaleString('tr-TR')} ₺<br>
            <strong>Kullanıcı:</strong> ${listing.user.name} (${listing.user.email})
          </div>
          
          <a href="${siteUrl}/admin/ilanlar?status=pending" class="button">
            İlanları Görüntüle
          </a>
          
          <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
            Bu email otomatik olarak gönderilmiştir. İlanı onaylamak için yukarıdaki butona tıklayın.
          </p>
        </div>
        <div class="footer">
          <p>Alo17 İlan Yönetim Sistemi</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Yeni İlan Onay Bekliyor

İlan Başlığı: ${listing.title}
Kategori: ${listing.category}
Fiyat: ${listing.price.toLocaleString('tr-TR')} ₺
Kullanıcı: ${listing.user.name} (${listing.user.email})

İlanları görüntülemek için: ${siteUrl}/admin/ilanlar?status=pending
  `;

  const result = await sendEmail({ to: adminEmail, subject, html, text });
  return result.success;
}

/**
 * Yeni kullanıcıya hoşgeldin maili gönder
 */
export async function sendWelcomeEmail(user: {
  name: string;
  email: string;
}): Promise<boolean> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alo17.tr';
  
  const subject = '🎉 Alo17\'e Hoş Geldiniz!';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .welcome-message { background: white; padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center; }
        .welcome-title { font-size: 28px; font-weight: bold; color: #1f2937; margin: 15px 0; }
        .welcome-text { font-size: 16px; color: #4b5563; margin: 15px 0; line-height: 1.8; }
        .features { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .feature-item { display: flex; align-items: center; margin: 15px 0; padding: 10px; }
        .feature-icon { font-size: 24px; margin-right: 15px; }
        .feature-text { font-size: 15px; color: #374151; }
        .button { display: inline-block; background: linear-gradient(135deg, #f97316 0%, #fbbf24 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 16px; }
        .button:hover { background: linear-gradient(135deg, #ea580c 0%, #f59e0b 100%); }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        .social-links { text-align: center; margin: 20px 0; }
        .social-links a { color: #2563eb; text-decoration: none; margin: 0 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;">🎉 Hoş Geldiniz!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Alo17 Ailesine Katıldığınız İçin Teşekkürler</p>
        </div>
        <div class="content">
          <div class="welcome-message">
            <div class="welcome-title">Merhaba ${user.name}!</div>
            <div class="welcome-text">
              Alo17'ye kayıt olduğunuz için çok teşekkür ederiz. Artık Çanakkale'nin en büyük ilan platformunun bir parçasısınız!
            </div>
          </div>
          
          <div class="features">
            <h3 style="color: #1f2937; margin-bottom: 20px; font-size: 20px;">✨ Platformumuzda Neler Yapabilirsiniz?</h3>
            
            <div class="feature-item">
              <span class="feature-icon">📢</span>
              <span class="feature-text"><strong>Ücretsiz İlan Verin:</strong> İstediğiniz kategoride ilanınızı oluşturun ve binlerce kişiye ulaşın</span>
            </div>
            
            <div class="feature-item">
              <span class="feature-icon">🔍</span>
              <span class="feature-text"><strong>Binlerce İlanı Keşfedin:</strong> Elektronik, giyim, ev eşyaları ve daha fazlası</span>
            </div>
            
            <div class="feature-item">
              <span class="feature-icon">⭐</span>
              <span class="feature-text"><strong>Premium Avantajlar:</strong> İlanlarınızı öne çıkarın, daha hızlı satın</span>
            </div>
            
            <div class="feature-item">
              <span class="feature-icon">📋</span>
              <span class="feature-text"><strong>Hukuki Belgeler:</strong> İhtiyacınıza uygun hukuki belge ve dilekçe şablonları</span>
            </div>
            
            <div class="feature-item">
              <span class="feature-icon">💬</span>
              <span class="feature-text"><strong>Güvenli Mesajlaşma:</strong> Alıcılarla güvenli bir şekilde iletişime geçin</span>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${siteUrl}/ilan-ver" class="button">
              🚀 İlk İlanınızı Verin
            </a>
          </div>
          
          <div class="welcome-text" style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px;">
            <p>Herhangi bir sorunuz varsa, bizimle iletişime geçmekten çekinmeyin.</p>
            <p>İyi alışverişler dileriz! 🛍️</p>
          </div>
        </div>
        <div class="footer">
          <p><strong>Alo17 - Çanakkale'nin En Büyük İlan Sitesi</strong></p>
          <p>${siteUrl}</p>
          <p style="margin-top: 15px; font-size: 11px; color: #9ca3af;">
            Bu email otomatik olarak gönderilmiştir. Lütfen bu email'e yanıt vermeyin.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
🎉 Alo17'ye Hoş Geldiniz!

Merhaba ${user.name}!

Alo17'ye kayıt olduğunuz için çok teşekkür ederiz. Artık Çanakkale'nin en büyük ilan platformunun bir parçasısınız!

Platformumuzda neler yapabilirsiniz?

📢 Ücretsiz İlan Verin: İstediğiniz kategoride ilanınızı oluşturun ve binlerce kişiye ulaşın
🔍 Binlerce İlanı Keşfedin: Elektronik, giyim, ev eşyaları ve daha fazlası
⭐ Premium Avantajlar: İlanlarınızı öne çıkarın, daha hızlı satın
📋 Hukuki Belgeler: İhtiyacınıza uygun hukuki belge ve dilekçe şablonları
💬 Güvenli Mesajlaşma: Alıcılarla güvenli bir şekilde iletişime geçin

İlk ilanınızı vermek için: ${siteUrl}/ilan-ver

Herhangi bir sorunuz varsa, bizimle iletişime geçmekten çekinmeyin.

İyi alışverişler dileriz! 🛍️

---
Alo17 - Çanakkale'nin En Büyük İlan Sitesi
${siteUrl}

Bu email otomatik olarak gönderilmiştir. Lütfen bu email'e yanıt vermeyin.
  `;

  const result = await sendEmail({ to: user.email, subject, html, text });
  return result.success;
}

/**
 * Abonelere yeni ilan bildirimi gönder
 */
export async function notifySubscribersNewListing(listing: {
  id: string;
  title: string;
  category: string;
  price: number;
  location: string;
  images?: string | null;
}): Promise<{ sent: number; failed: number }> {
  const { prisma } = await import('./prisma');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alo17.tr';
  
  try {
    // Aktif aboneleri çek
    const subscribers = await prisma.emailSubscription.findMany({
      where: { isActive: true },
      select: { email: true },
    });

    if (subscribers.length === 0) {
      console.log('📧 Email abonesi bulunamadı');
      return { sent: 0, failed: 0 };
    }

    // İlan görseli (ilk resim)
    let imageUrl = '';
    if (listing.images) {
      try {
        const images = typeof listing.images === 'string' 
          ? JSON.parse(listing.images) 
          : listing.images;
        if (Array.isArray(images) && images.length > 0) {
          imageUrl = images[0];
        }
      } catch {
        // Görsel parse edilemedi, devam et
      }
    }

    const subject = `🆕 Yeni İlan: ${listing.title}`;
    const { createListingSlug } = await import('@/lib/slug');
    const listingUrl = `${siteUrl}/ilan/${createListingSlug(listing.title, listing.id)}`;
    
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
          .listing-card { background: white; padding: 20px; border-radius: 5px; margin: 15px 0; }
          .listing-image { width: 100%; max-width: 300px; height: auto; border-radius: 5px; margin: 10px 0; }
          .listing-title { font-size: 20px; font-weight: bold; color: #1f2937; margin: 10px 0; }
          .listing-info { color: #6b7280; margin: 5px 0; }
          .listing-price { font-size: 24px; font-weight: bold; color: #2563eb; margin: 15px 0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          .unsubscribe { text-align: center; font-size: 11px; color: #9ca3af; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🆕 Yeni İlan Yayınlandı!</h2>
          </div>
          <div class="content">
            <p>Merhaba,</p>
            <p>Alo17'de yeni bir ilan yayınlandı. İlan detaylarını görmek için aşağıdaki butona tıklayın:</p>
            
            <div class="listing-card">
              ${imageUrl ? `<img src="${imageUrl}" alt="${listing.title}" class="listing-image" />` : ''}
              <div class="listing-title">${listing.title}</div>
              <div class="listing-info">📍 ${listing.location}</div>
              <div class="listing-info">📂 ${listing.category}</div>
              <div class="listing-price">${listing.price.toLocaleString('tr-TR')} ₺</div>
            </div>
            
            <a href="${listingUrl}" class="button">
              İlanı Görüntüle
            </a>
            
            <div class="unsubscribe">
              <p>Bu bildirimleri almak istemiyorsanız, <a href="${siteUrl}/unsubscribe?email={EMAIL}">buradan</a> aboneliğinizi iptal edebilirsiniz.</p>
            </div>
          </div>
          <div class="footer">
            <p>Alo17 - Çanakkale'nin En Büyük İlan Sitesi</p>
            <p>${siteUrl}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Yeni İlan Yayınlandı!

${listing.title}
📍 ${listing.location}
📂 ${listing.category}
💰 ${listing.price.toLocaleString('tr-TR')} ₺

İlanı görüntülemek için: ${listingUrl}

Aboneliğinizi iptal etmek için: ${siteUrl}/unsubscribe
    `;

    // Tüm abonelere email gönder
    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      try {
        // Email içindeki {EMAIL} placeholder'ını değiştir
        const personalizedHtml = html.replace(/{EMAIL}/g, encodeURIComponent(subscriber.email));
        
        const result = await sendEmail({
          to: subscriber.email,
          subject,
          html: personalizedHtml,
          text,
        });

        if (result.success) {
          sent++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Email gönderme hatası (${subscriber.email}):`, error);
        failed++;
      }
    }

    console.log(`📧 Yeni ilan bildirimi gönderildi: ${sent} başarılı, ${failed} başarısız`);
    return { sent, failed };
  } catch (error) {
    console.error('Abonelere email gönderme hatası:', error);
    return { sent: 0, failed: 0 };
  }
}

/**
 * İlan sahibine: ilan alındı (onay bekliyor) maili gönder
 */
export async function sendListingSubmittedEmail(input: {
  listing: { id: string; title: string };
  user: { name?: string | null; email: string };
  approvalStatus?: string | null;
}): Promise<boolean> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alo17.tr';
  const status = (input.approvalStatus || 'pending').toString();
  const requiresPayment = status === 'payment_pending';
  const subject = requiresPayment
    ? `💳 Ödeme bekleniyor: ${input.listing.title}`
    : `✅ İlanınız alındı: ${input.listing.title}`;
  const name = input.user.name || 'Kullanıcı';
  const paymentUrl = `${siteUrl}/odeme?listingId=${encodeURIComponent(input.listing.id)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 6px 6px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .info { background: white; padding: 15px; border-radius: 6px; margin: 12px 0; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; margin-top: 16px; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0;">✅ İlanınız alındı</h2>
        </div>
        <div class="content">
          <p>Merhaba ${name},</p>
          ${
            requiresPayment
              ? `<p>İlanınız oluşturuldu ancak <strong>ödeme bekliyor</strong>. Yayınlanması için lütfen ödemenizi tamamlayın.</p>`
              : `<p>İlanınız başarıyla alınmıştır. Moderatör onayından sonra yayınlanacaktır.</p>`
          }

          <div class="info">
            <strong>İlan başlığı:</strong> ${input.listing.title}<br>
            <strong>Durum:</strong> ${requiresPayment ? 'Ödeme bekliyor' : 'Onay bekliyor'}
          </div>

          ${
            requiresPayment
              ? `<a href="${paymentUrl}" class="button">Ödemeyi Tamamla</a>`
              : `<a href="${siteUrl}/ilanlarim" class="button">İlanlarım</a>`
          }

          <p style="margin-top: 16px; font-size: 13px; color: #6b7280;">
            ${
              requiresPayment
                ? 'Not: Ödeme tamamlandıktan sonra ilanınız moderasyon onayına alınır.'
                : 'Not: İlanınız onaylandıktan sonra yayına alınır ve ilan sayfası görünür hale gelir.'
            }
          </p>
        </div>
        <div class="footer">
          <p>Alo17</p>
          <p>${siteUrl}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
İlanınız alındı

Merhaba ${name},
${requiresPayment
  ? 'İlanınız oluşturuldu ancak ödeme bekliyor. Yayınlanması için lütfen ödemenizi tamamlayın.'
  : 'İlanınız başarıyla alınmıştır. Moderatör onayından sonra yayınlanacaktır.'}

İlan başlığı: ${input.listing.title}
Durum: ${requiresPayment ? 'Ödeme bekliyor' : 'Onay bekliyor'}

${requiresPayment ? `Ödeme linki: ${paymentUrl}` : `İlanlarım: ${siteUrl}/ilanlarim`}
  `;

  const result = await sendEmail({ to: input.user.email, subject, html, text });
  return result.success;
}

/**
 * İlan sahibine: ilan onaylandı maili gönder
 */
export async function sendListingApprovedEmail(input: {
  listing: { id: string; title: string };
  user: { name?: string | null; email: string };
}): Promise<boolean> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alo17.tr';
  const { createListingSlug } = await import('@/lib/slug');
  const listingUrl = `${siteUrl}/ilan/${createListingSlug(input.listing.title, input.listing.id)}`;
  const subject = `🎉 İlanınız onaylandı: ${input.listing.title}`;
  const name = input.user.name || 'Kullanıcı';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #16a34a; color: white; padding: 20px; border-radius: 6px 6px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .info { background: white; padding: 15px; border-radius: 6px; margin: 12px 0; }
        .button { display: inline-block; background: #16a34a; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; margin-top: 16px; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0;">🎉 İlanınız onaylandı</h2>
        </div>
        <div class="content">
          <p>Merhaba ${name},</p>
          <p>İlanınız onaylandı ve yayına alındı. Aşağıdaki butondan ilanınızı görüntüleyebilirsiniz.</p>

          <div class="info">
            <strong>İlan başlığı:</strong> ${input.listing.title}<br>
            <strong>Durum:</strong> Yayında
          </div>

          <a href="${listingUrl}" class="button">İlanı Görüntüle</a>
        </div>
        <div class="footer">
          <p>Alo17</p>
          <p>${siteUrl}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
İlanınız onaylandı

Merhaba ${name},
İlanınız onaylandı ve yayına alındı.

İlan başlığı: ${input.listing.title}
Durum: Yayında

İlan linki: ${listingUrl}
  `;

  const result = await sendEmail({ to: input.user.email, subject, html, text });
  return result.success;
}

/**
 * İlan sahibine: ilan reddedildi maili gönder
 */
export async function sendListingRejectedEmail(input: {
  listing: { id: string; title: string };
  user: { name?: string | null; email: string };
  reason?: string | null;
}): Promise<boolean> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alo17.tr';
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER || 'destek@alo17.tr';
  const subject = `⚠️ İlanınız reddedildi: ${input.listing.title}`;
  const name = input.user.name || 'Kullanıcı';
  const reasonBlock = input.reason ? `<p><strong>Red nedeni:</strong> ${input.reason}</p>` : '';
  const reasonText = input.reason ? `Red nedeni: ${input.reason}\n` : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; border-radius: 6px 6px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .info { background: white; padding: 15px; border-radius: 6px; margin: 12px 0; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; margin-top: 16px; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0;">⚠️ İlanınız reddedildi</h2>
        </div>
        <div class="content">
          <p>Merhaba ${name},</p>
          <p>Maalesef ilanınız moderasyon kontrolünden geçemedi ve reddedildi.</p>

          <div class="info">
            <strong>İlan başlığı:</strong> ${input.listing.title}<br>
            <strong>Durum:</strong> Reddedildi
          </div>

          ${reasonBlock}

          <p style="margin-top: 16px; font-size: 13px; color: #6b7280;">
            Sorularınız için bizimle iletişime geçebilirsiniz: <a href="mailto:${supportEmail}">${supportEmail}</a>
          </p>

          <a href="${siteUrl}/ilan-ver" class="button">Yeni İlan Ver</a>
        </div>
        <div class="footer">
          <p>Alo17</p>
          <p>${siteUrl}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
İlanınız reddedildi

Merhaba ${name},
Maalesef ilanınız moderasyon kontrolünden geçemedi ve reddedildi.

İlan başlığı: ${input.listing.title}
Durum: Reddedildi
${reasonText}
Destek: ${supportEmail}

Yeni ilan ver: ${siteUrl}/ilan-ver
  `;

  const result = await sendEmail({ to: input.user.email, subject, html, text });
  return result.success;
}

