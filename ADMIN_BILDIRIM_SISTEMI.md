# Admin Bildirim Sistemi

## ✅ Eklenen Özellikler

### 1. Email Bildirimi
- **Dosya:** `src/lib/email.ts`
- **Fonksiyon:** `notifyAdminNewListing()`
- **Durum:** Şimdilik console.log ile simüle ediliyor
- **Gerçek Email Servisi:** Nodemailer, SendGrid, Resend, AWS SES entegre edilebilir

### 2. Database Notification
- **Dosya:** `src/lib/notifications.ts`
- **Fonksiyon:** `createAdminNotificationForNewListing()`
- **Durum:** Aktif - Notification tablosuna kayıt yapıyor

### 3. Notification API
- **Dosya:** `src/app/api/notifications/route.ts`
- **Endpoints:**
  - `GET /api/notifications` - Bildirimleri getir
  - `PUT /api/notifications` - Bildirimi okundu işaretle

### 4. Header Notification Dropdown
- **Dosya:** `src/components/Header.tsx`
- **Özellikler:**
  - Bildirim sayacı (kırmızı badge)
  - Son 10 bildirim gösterimi
  - Okundu/okunmadı durumu
  - Otomatik yenileme (30 saniye)
  - "Tümünü okundu işaretle" butonu

### 5. İlan Oluşturma Entegrasyonu
- **Dosya:** `src/app/api/listings/route.ts`
- **Durum:** Yeni ilan oluşturulduğunda otomatik bildirim gönderiliyor

## 📧 Email Servisi Kurulumu

### Nodemailer Örneği

`.env` dosyasına ekleyin:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@alo17.tr
```

`src/lib/email.ts` dosyasındaki TODO kısmını doldurun:
```typescript
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

await transporter.sendMail({
  from: process.env.SMTP_FROM,
  to: options.to,
  subject: options.subject,
  html: options.html,
  text: options.text,
});
```

### Alternatif Email Servisleri

1. **Resend** (Önerilen - Modern, kolay)
   ```bash
   npm install resend
   ```

2. **SendGrid**
   ```bash
   npm install @sendgrid/mail
   ```

3. **AWS SES**
   ```bash
   npm install @aws-sdk/client-ses
   ```

## 🔔 Bildirim Türleri

- **system** - Sistem bildirimleri (yeni ilan, vb.)
- **expiry_warning** - Süre uyarıları
- **payment** - Ödeme bildirimleri

## 📊 Kullanım

### Admin Bildirimleri Görüntüleme

1. **Header'dan:** Bell ikonuna tıklayın
2. **Sayfadan:** `/notifications` sayfasına gidin
3. **Admin Panel:** `/admin/ilanlar?status=pending` - Bekleyen ilanlar

### Bildirim Okundu İşaretleme

- Tek bildirim: Bildirime tıklayın
- Tüm bildirimler: "Tümünü okundu işaretle" butonuna tıklayın

## 🚀 Gelecek İyileştirmeler

1. **Push Notification** - Tarayıcı push bildirimleri
2. **SMS Bildirimi** - Kritik durumlar için
3. **Webhook** - Harici sistemlere bildirim
4. **Email Template** - Daha profesyonel email tasarımları
5. **Bildirim Filtreleme** - Tür ve tarih bazlı filtreleme

## 📝 Notlar

- Email servisi şu anda simüle ediliyor (console.log)
- Database notification aktif ve çalışıyor
- Header'da bildirim sayacı otomatik güncelleniyor
- Bildirimler 30 saniyede bir otomatik yenileniyor

