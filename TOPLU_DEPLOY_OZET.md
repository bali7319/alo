# Toplu Deploy - Admin Özellikleri + Bildirim Sistemi

## 🚀 Deploy Yöntemleri

### Yöntem 1: PowerShell Script (Önerilen)
```powershell
.\DEPLOY_TOPLU.ps1
```

### Yöntem 2: Tek Komut
`DEPLOY_TEK_KOMUT.txt` dosyasındaki komutu kopyalayıp PowerShell'de çalıştırın.

## ✅ Eklenen Özellikler

### 1. Admin İlan Yönetimi
- **Süre Uzatma:** Süresi dolmuş veya 7 gün içinde dolacak ilanlar için "Süre Uzat (30g)" butonu
- **Premium 3 Aylık:** 90 günlük premium seçeneği
- **Premium Yıllık:** 365 günlük premium seçeneği
- **Görsel Uyarılar:** Süresi dolmuş ilanlar kırmızı, yakında dolacaklar turuncu

### 2. Bildirim Sistemi
- **Email Bildirimi:** Yeni ilan oluşturulduğunda admin'e email (şimdilik simüle ediliyor)
- **Database Notification:** Notification tablosuna kayıt
- **Header Dropdown:** Bildirim sayacı ve son 10 bildirim gösterimi
- **Otomatik Yenileme:** Her 30 saniyede bir bildirimler kontrol edilir

### 3. Sesli Uyarı 🔔
- **Web Audio API:** Yeni bildirim geldiğinde 800 Hz bip sesi
- **Akıllı Tetikleme:** Sadece yeni bildirim geldiğinde çalar (ilk yüklemede çalmaz)
- **Tarayıcı Desteği:** Modern tarayıcılarda çalışır

## 📁 Deploy Edilen Dosyalar

1. `src/app/admin/ilanlar/page.tsx` - Admin ilanlar sayfası
2. `src/app/api/admin/listings/[id]/route.ts` - Admin listings API
3. `src/lib/email.ts` - Email servisi
4. `src/lib/notifications.ts` - Notification servisi
5. `src/app/api/notifications/route.ts` - Notification API
6. `src/components/Header.tsx` - Header (sesli uyarı ile)
7. `src/app/api/listings/route.ts` - Listings API (bildirim entegrasyonu)

## 🎯 Nasıl Çalışır?

### Süre Uzatma
1. Admin panelinde süresi dolmuş ilanları görür
2. "Süre Uzat (30g)" butonuna tıklar
3. İlan 30 gün daha uzatılır ve aktif hale getirilir

### Premium Seçenekleri
1. Standart ilan için "Premium (3ay)" veya "Premium (1yıl)" butonuna tıklar
2. İlan premium yapılır ve belirtilen süre kadar premium kalır

### Bildirim Sistemi
1. Yeni ilan oluşturulduğunda:
   - Email bildirimi gönderilir (simüle)
   - Database notification oluşturulur
   - Admin header'da bildirim sayacı görünür
   - Yeni bildirim geldiğinde **sesli uyarı çalar** 🔔

2. Admin bildirimleri görüntüleyebilir:
   - Header'daki Bell ikonuna tıklayarak
   - `/notifications` sayfasından
   - Admin panelinden (`/admin/ilanlar?status=pending`)

## 🔧 Email Servisi Kurulumu (Opsiyonel)

Gerçek email göndermek için `.env` dosyasına ekleyin:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@alo17.tr
```

Ve `src/lib/email.ts` dosyasındaki TODO kısmını doldurun.

## 📊 Test

1. **Admin Panel:** https://alo17.tr/admin/ilanlar
2. **Bildirimler:** Header'daki Bell ikonuna tıklayın
3. **Sesli Uyarı:** Yeni ilan oluşturun ve admin olarak giriş yapın

## 🎵 Sesli Uyarı Detayları

- **Frekans:** 800 Hz
- **Süre:** 0.2 saniye
- **Tip:** Sine wave
- **Tetiklendiği Durum:** Yeni bildirim geldiğinde (unreadCount artışı)
- **Tarayıcı Desteği:** Chrome, Firefox, Edge, Safari (modern versiyonlar)

## 📝 Notlar

- Email servisi şu anda simüle ediliyor (console.log)
- Database notification aktif ve çalışıyor
- Header'da bildirim sayacı otomatik güncelleniyor
- Sesli uyarı sadece yeni bildirim geldiğinde çalar
- Bildirimler 30 saniyede bir otomatik yenileniyor

