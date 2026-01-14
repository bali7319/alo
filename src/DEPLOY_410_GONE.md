# 410 Gone Deploy Rehberi

Bu rehber, middleware'deki 410 Gone değişikliklerinin sunucuya deploy edilmesi için adımları içerir.

## 📋 Değişiklik Özeti

**Değiştirilen Dosyalar:**
- ✅ `src/middleware.ts` - 301 Redirect → 410 Gone
- ✅ `src/app/robots.ts` - Robots.txt optimizasyonu
- ✅ `src/app/sitemap.ts` - Sitemap optimizasyonu
- ✅ `src/lib/metadata.ts` - Canonical URL helper (yeni)
- ✅ `src/lib/api-error.ts` - API error handler (yeni)

## 🚀 Deploy Adımları

### Yöntem 1: Mevcut Script ile (Önerilen)

Sunucuda aşağıdaki komutu çalıştırın:

```bash
cd /var/www/alo17
bash src/SUNUCU_GUNCELLE.sh
```

Bu script otomatik olarak:
1. ✅ Git pull yapar
2. ✅ NPM paketleri yükler
3. ✅ Prisma generate yapar
4. ✅ Build yapar
5. ✅ PM2 restart eder

### Yöntem 2: Manuel Deploy

Eğer script kullanmak istemiyorsanız:

```bash
# 1. Proje dizinine git
cd /var/www/alo17

# 2. Git pull
git pull origin main

# 3. NPM paketleri yükle
npm install --legacy-peer-deps

# 4. Prisma generate
npx prisma generate

# 5. Build yap
npm run build

# 6. PM2 restart
pm2 restart alo17

# 7. Log kontrolü
pm2 logs alo17 --lines 50
```

### Yöntem 3: Windows'tan Deploy (SSH ile)

PowerShell'de:

```powershell
# SSH ile bağlan ve script çalıştır
ssh kullanici@sunucu-ip "cd /var/www/alo17 && bash src/SUNUCU_GUNCELLE.sh"
```

## ✅ Deploy Sonrası Kontroller

### 1. Build Başarılı mı?

```bash
# PM2 log kontrolü
pm2 logs alo17 --lines 50

# Hata var mı kontrol et
pm2 logs alo17 --err --lines 20
```

### 2. 410 Gone Çalışıyor mu?

```bash
# Test komutu
curl -I https://alo17.tr/commodity/test
# Beklenen: HTTP/1.1 410 Gone

curl -I https://alo17.tr/12345678901
# Beklenen: HTTP/1.1 410 Gone
```

### 3. www Yönlendirmesi Çalışıyor mu?

```bash
curl -I https://www.alo17.tr/test
# Beklenen: HTTP/1.1 301 Moved Permanently
# Location: https://alo17.tr/test
```

### 4. Normal Sayfalar Çalışıyor mu?

```bash
curl -I https://alo17.tr/
# Beklenen: HTTP/1.1 200 OK

curl -I https://alo17.tr/ilanlar
# Beklenen: HTTP/1.1 200 OK
```

## 🔍 Olası Sorunlar ve Çözümleri

### Sorun 1: Build Hatası

**Hata:**
```
Error: Cannot find module '@/lib/metadata'
```

**Çözüm:**
```bash
# Yeni dosyalar eklenmiş olabilir, npm install tekrar çalıştır
npm install --legacy-peer-deps
npm run build
```

### Sorun 2: PM2 Restart Başarısız

**Hata:**
```
PM2 restart failed
```

**Çözüm:**
```bash
# PM2 durumunu kontrol et
pm2 status

# Manuel restart
pm2 restart alo17 --update-env

# Eğer hala çalışmıyorsa, stop ve start
pm2 stop alo17
pm2 start ecosystem.config.js
```

### Sorun 3: Middleware Çalışmıyor

**Kontrol:**
```bash
# Middleware dosyası doğru mu?
cat src/middleware.ts | grep "410"

# Build cache temizle
rm -rf .next
npm run build
pm2 restart alo17
```

### Sorun 4: 410 Gone Yerine 404 Dönüyor

**Kontrol:**
```bash
# Middleware matcher doğru mu?
cat src/middleware.ts | grep "matcher"

# Next.js cache temizle
rm -rf .next/cache
npm run build
pm2 restart alo17
```

## 📊 Deploy Sonrası Monitoring

### 1. Google Search Console

1-2 hafta sonra kontrol edin:
- Coverage Report → "Excluded" sekmesi
- 410 Gone sayfalarını görmelisiniz
- Index'ten çıkma süresini takip edin

### 2. Server Logs

```bash
# PM2 log takibi
pm2 logs alo17 --lines 100

# Nginx access log (410 Gone istekleri)
tail -f /var/log/nginx/access.log | grep "410"
```

### 3. Analytics

- 410 Gone trafiğini takip edin
- Kullanıcıların ana sayfaya yönlendirilip yönlendirilmediğini kontrol edin

## 🎯 Beklenen Sonuçlar

### Hemen (Deploy sonrası)
- ✅ Eski URL'ler 410 Gone döndürmeli
- ✅ www yönlendirmesi çalışmalı
- ✅ Normal sayfalar çalışmalı

### 1-2 Hafta Sonra
- ✅ Google Search Console'da 410 Gone sayfaları görünmeli
- ✅ Index'ten çıkma başlamalı
- ✅ 404 hataları azalmalı

### 1 Ay Sonra
- ✅ Eski URL'ler index'ten çıkmış olmalı
- ✅ Crawl budget korunmuş olmalı
- ✅ Index kalitesi artmış olmalı

## 📝 Rollback (Geri Alma)

Eğer bir sorun olursa ve geri almak isterseniz:

```bash
# Önceki commit'e dön
cd /var/www/alo17
git log --oneline -5  # Son 5 commit'i gör
git checkout <önceki-commit-hash>

# Build ve restart
npm run build
pm2 restart alo17
```

## 🔗 İlgili Dokümantasyon

- `ESKI_URL_SILME_410_GONE.md` - 410 Gone yaklaşımı detayları
- `SEO_İYİLEŞTİRMELER.md` - Genel SEO iyileştirmeleri
- `ESKI_URL_YONLENDIRMELERI.md` - Önceki 301 redirect yaklaşımı (artık kullanılmıyor)

## ✅ Deploy Checklist

Deploy öncesi:
- [ ] Git'te tüm değişiklikler commit edildi mi?
- [ ] Local'de build başarılı mı? (`npm run build`)
- [ ] Test edildi mi? (Local'de 410 Gone test edildi mi?)

Deploy sırasında:
- [ ] Git pull başarılı mı?
- [ ] NPM install başarılı mı?
- [ ] Build başarılı mı?
- [ ] PM2 restart başarılı mı?

Deploy sonrası:
- [ ] 410 Gone test edildi mi?
- [ ] www yönlendirmesi test edildi mi?
- [ ] Normal sayfalar çalışıyor mu?
- [ ] PM2 log'ları kontrol edildi mi?

## 🆘 Destek

Sorun yaşarsanız:
1. PM2 log'larını kontrol edin: `pm2 logs alo17`
2. Build log'larını kontrol edin
3. Nginx error log'larını kontrol edin: `tail -f /var/log/nginx/error.log`
