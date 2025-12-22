# Yarın Yapılacaklar - PayTR Entegrasyonu Deploy

## 📋 Durum
- ✅ PayTR entegrasyonu kodlandı
- ✅ Git push yapıldı
- ✅ .env dosyası PayTR bilgileri ile güncellendi
- ❌ Git pull sunucuda çalışmıyor (bellek sorunu)
- ❌ Yeni dosyalar sunucuya yüklenmedi

## 🎯 Yapılacaklar

### 1. WinSCP ile Dosya Yükleme

**Bağlantı Bilgileri:**
- Host: `alo17.tr`
- Kullanıcı: `root`
- Şifre: (sunucu şifresi)

**Yüklenecek Dosyalar:**

#### Yeni API Dosyaları:
1. `C:\Users\bali\Desktop\alo\src\app\api\listings\[id]\route.ts`
   → `/var/www/alo17/src/app/api/listings/[id]/route.ts`
   - **ÖNEMLİ:** `[id]` klasörünü WinSCP'de köşeli parantezlerle oluşturun

2. `C:\Users\bali\Desktop\alo\src\app\api\payment\initialize\route.ts`
   → `/var/www/alo17/src/app/api/payment/initialize/route.ts`

3. `C:\Users\bali\Desktop\alo\src\app\api\payment\failed\route.ts`
   → `/var/www/alo17/src/app/api/payment/failed/route.ts`

4. `C:\Users\bali\Desktop\alo\src\app\api\payment\callback\route.ts`
   → `/var/www/alo17/src/app/api/payment/callback/route.ts`

#### Güncellenmiş Sayfalar:
5. `C:\Users\bali\Desktop\alo\src\app\odeme\page.tsx`
   → `/var/www/alo17/src/app/odeme/page.tsx` (üzerine yaz)

6. `C:\Users\bali\Desktop\alo\src\app\odeme\basarili\page.tsx`
   → `/var/www/alo17/src/app/odeme/basarili/page.tsx` (üzerine yaz)

### 2. Deploy Komutları

Dosyaları yükledikten sonra sunucuda çalıştırın:

```bash
cd /var/www/alo17

# Build yap
NODE_OPTIONS="--max-old-space-size=1024" npm run build

# PM2'yi başlat
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

### 3. Kontrol

Build başarılı olduktan sonra:
- ✅ PM2 durumunu kontrol edin (`pm2 status`)
- ✅ Siteyi test edin: `https://alo17.tr/odeme`
- ✅ PayTR entegrasyonunu test edin

## 📝 Notlar

- `.env` dosyası zaten PayTR bilgileri ile güncellendi
- PayTR panelinde callback URL'lerini ayarlamayı unutmayın:
  - Başarılı: `https://alo17.tr/odeme/basarili`
  - Başarısız: `https://alo17.tr/odeme/basarisiz`
- Production'da `test_mode=0` olacak (kodda otomatik)

## 🔧 Sorun Giderme

Eğer build hatası alırsanız:
```bash
# Hata mesajını kontrol et
npm run build 2>&1 | tail -50

# Eksik dosyaları kontrol et
ls -la src/app/api/payment/initialize/route.ts
ls -la src/app/api/payment/callback/route.ts
ls -la src/app/api/listings/\[id\]/route.ts
```

## ✅ Tamamlanan İşler

1. ✅ Kariyer sistemi eklendi
2. ✅ Footer'a "Kariyer" linki eklendi
3. ✅ Admin panelinde kariyer başvuruları sayfası
4. ✅ Fotoğraf yükleme sınırları (max 10 resim, 5MB)
5. ✅ Yemek-içecek filtreleri kaldırıldı
6. ✅ PayTR entegrasyonu kodlandı
7. ✅ .env dosyası PayTR bilgileri ile güncellendi

## 🚀 Sonraki Adımlar

1. WinSCP ile dosyaları yükle
2. Build yap
3. PM2'yi başlat
4. Test et

