# 🖼️ Resim Optimizasyonu - Deploy

## ✅ Yapılan Değişiklikler

### 1. `next.config.js`
- `cacheMaxMemorySize: 0` eklendi (geçici çözüm - Single item size exceeds maxSize hatası için)

### 2. `src/lib/image-utils.ts` (YENİ)
- `compressImageToBase64()` - Resimleri optimize eder (max 1920x1080, kalite 0.8)
- `compressImagesToBase64()` - Birden fazla resmi optimize eder
- 5MB dosya boyutu limiti

### 3. `src/app/ilan-ver/page.tsx`
- `convertImagesToBase64()` fonksiyonu optimize edildi
- Resimler yüklenmeden önce boyutları küçültülüyor

### 4. `src/app/ilan-ver/duzenle/[id]/page.tsx`
- Resim yükleme optimize edildi
- Fallback mekanizması eklendi

## 🚀 Deploy Komutları

### 1. Dosyaları Transfer Et (PowerShell)

```powershell
cd C:\Users\bali\Desktop\alo
scp next.config.js root@alo17.tr:/var/www/alo17/next.config.js
scp src/lib/image-utils.ts root@alo17.tr:/var/www/alo17/src/lib/image-utils.ts
scp "src/app/ilan-ver/page.tsx" root@alo17.tr:/var/www/alo17/src/app/ilan-ver/page.tsx
scp "src/app/ilan-ver/duzenle/[id]/page.tsx" root@alo17.tr:/var/www/alo17/src/app/ilan-ver/duzenle/[id]/page.tsx
scp "src/app/api/listings/[id]/route.ts" root@alo17.tr:/var/www/alo17/src/app/api/listings/[id]/route.ts
```

### 2. Sunucuda Build ve Restart (SSH)

```bash
ssh root@alo17.tr
cd /var/www/alo17

# Cache'i temizle
rm -rf .next/cache
rm -rf .next

# Build
npm run build

# Restart
pm2 restart alo17

# Log'ları kontrol et
pm2 logs alo17 --err --lines 50
```

## ✅ Beklenen Sonuç

- "Single item size exceeds maxSize" hatası azalacak
- Yeni yüklenen resimler optimize edilecek (max 1920x1080)
- Base64 boyutları küçülecek (%50-70 azalma)
- Timeout hataları azalacak

## 📊 Resim Optimizasyon Detayları

- **Maksimum boyut:** 1920x1080px
- **JPEG kalitesi:** 0.8 (80%)
- **Dosya boyutu limiti:** 5MB
- **Format:** JPEG (otomatik)

## ⚠️ Not

- Mevcut resimler optimize edilmeyecek (sadece yeni yüklenenler)
- Eski resimleri optimize etmek için migration script'i gerekir
- Gelecekte dosya sunucusu kullanılması önerilir

