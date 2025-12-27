# Prerender Manifest ve Cache Sorunu Çözümü

## 🔍 Sorunlar

1. **prerender-manifest.json eksik** - Sürekli restart'a neden oluyor
2. **Single item size exceeds maxSize** - Next.js cache limiti aşılıyor

## ✅ Çözüm (Sunucuda Çalıştırın)

```bash
cd /var/www/alo17

# 1. PM2'yi durdur
pm2 delete alo17

# 2. .next klasörünü tamamen temizle
rm -rf .next

# 3. node_modules/.cache'i temizle (opsiyonel ama önerilir)
rm -rf node_modules/.cache

# 4. Prisma client'ı yeniden oluştur
npx prisma generate

# 5. Temiz build yap
npm run build

# 6. Build başarılı mı kontrol et
ls -la .next/prerender-manifest.json

# 7. PM2'yi başlat
pm2 start ecosystem.config.js

# 8. PM2'yi kaydet
pm2 save

# 9. Restart sayısını sıfırla
pm2 reset alo17

# 10. Durumu kontrol et
pm2 status
pm2 logs alo17 --lines 20
```

## 🚀 Tek Komut (Hızlı Çözüm)

```bash
cd /var/www/alo17 && pm2 delete alo17 && rm -rf .next node_modules/.cache && npx prisma generate && npm run build && ls -la .next/prerender-manifest.json && pm2 start ecosystem.config.js && pm2 save && pm2 reset alo17 && pm2 status
```

## ✅ Başarı Kontrolü

Build sonrası şu dosyanın var olduğunu kontrol edin:

```bash
ls -la .next/prerender-manifest.json
```

Eğer dosya varsa, çıktı şöyle olmalı:
```
-rw-r--r-- 1 root root 1234 Dec 25 11:00 .next/prerender-manifest.json
```

## 🔧 Yapılan Değişiklikler

1. **next.config.js** güncellendi:
   - `onDemandEntries` cache ayarları eklendi
   - `experimental.staleTimes` eklendi
   - Bu ayarlar "Single item size exceeds maxSize" hatasını önler

## 📊 PM2 Durumu Kontrolü

```bash
# Restart sayısı 0-1 olmalı
pm2 status

# Hata logları temiz olmalı
pm2 logs alo17 --err --lines 20
```

## ⚠️ Eğer Sorun Devam Ederse

1. **prerender-manifest.json hala eksikse:**
   ```bash
   # Build'i verbose modda çalıştır
   npm run build -- --debug
   ```

2. **Cache hatası devam ederse:**
   ```bash
   # Next.js cache'i tamamen temizle
   rm -rf .next/cache
   npm run build
   ```

3. **Port çakışması varsa:**
   ```bash
   # Port 3000'i kullanan process'i bul
   lsof -i :3000
   # Eğer başka bir process varsa, onu durdurun
   ```

## 🎯 Beklenen Sonuç

- ✅ PM2 restart sayısı: **0-1** (çok düşük)
- ✅ prerender-manifest.json: **mevcut**
- ✅ "Single item size exceeds maxSize" hatası: **yok**
- ✅ PM2 status: **online**
- ✅ Port 3000: **LISTEN**

