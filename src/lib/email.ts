/**
 * Email gönderme servisi
 * Şimdilik console.log ile simüle ediliyor
 * Gerçek email servisi için (Nodemailer, SendGrid, Resend, vb.) entegre edilebilir
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // SMTP ayarları kontrol et
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    // From adresi SMTP_USER ile aynı olmalı (relay hatası önlemek için)
    const smtpFrom = process.env.SMTP_FROM || smtpUser || 'noreply@alo17.tr';

    // Eğer SMTP ayarları yoksa, simülasyon modunda çalış
    if (!smtpHost || !smtpUser || !smtpPass) {
      console.log('📧 [EMAIL SIMULATION] Email gönderiliyor:', {
        to: options.to,
        subject: options.subject,
        note: 'SMTP ayarları yapılandırılmamış, email simüle ediliyor',
      });
      return true;
    }

    // Nodemailer ile gerçek email gönder
    const nodemailer = await import('nodemailer');
    const port = parseInt(smtpPort || '587');
    const isSecure = port === 465;
    
    // mail.kurumsaleposta.com ayarlarına göre:
    // Port 587, SSL/TLS: Kapalı, STARTTLS: false (destek ekibi onayı)
    // SMTP authentication zorunlu (relay hatası önlemek için)
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: port,
      secure: isSecure, // 465 portu SSL kullanır, 587 için false
      // SMTP authentication (Nodemailer otomatik algılar)
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      // TLS ayarları - mail.kurumsaleposta.com için
      tls: {
        rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false',
        // Eski sunucular için uyumluluk
        minVersion: 'TLSv1',
        secureProtocol: 'TLSv1_2_method',
      },
      // Port 587 için STARTTLS kapalı (destek ekibi: starttls => false)
      requireTLS: false, // STARTTLS kullanma
      connectionTimeout: 10000, // 10 saniye timeout
      greetingTimeout: 10000,
      // Relay hatası önlemek için
      pool: false,
      maxConnections: 1,
    });

    // Email gönder
    // From adresi SMTP_USER ile aynı olmalı (relay hatası önlemek için)
    const fromAddress = smtpFrom === smtpUser ? smtpFrom : smtpUser;
    
    // SMTP bağlantısını test et
    try {
      await transporter.verify();
      console.log('✅ SMTP bağlantısı başarılı:', { host: smtpHost, port: port });
    } catch (verifyError: any) {
      console.error('❌ SMTP bağlantı hatası:', {
        host: smtpHost,
        port: port,
        error: verifyError.message,
        code: verifyError.code,
      });
      throw verifyError;
    }

    const info = await transporter.sendMail({
      from: fromAddress, // SMTP_USER ile aynı kullan
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // HTML'den text çıkar
    });

    console.log('📧 Email başarıyla gönderildi:', {
      to: options.to,
      subject: options.subject,
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });

    // Eğer email reddedildiyse uyar
    if (info.rejected && info.rejected.length > 0) {
      console.error('⚠️ Email reddedildi:', {
        to: options.to,
        rejected: info.rejected,
        response: info.response,
      });
    }

    return true;
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
    return false;
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

  return await sendEmail({
    to: adminEmail,
    subject,
    html,
    text,
  });
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

  return await sendEmail({
    to: user.email,
    subject,
    html,
    text,
  });
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
    const listingUrl = `${siteUrl}/ilan/${listing.id}`;
    
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
        
        const success = await sendEmail({
          to: subscriber.email,
          subject,
          html: personalizedHtml,
          text,
        });

        if (success) {
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

