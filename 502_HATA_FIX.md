# 502 Bad Gateway Hatası - Güncel Düzeltmeler

## 🔍 Sorun

- `GET /api/listings/user` → 502 Bad Gateway
- `GET /api/listings/favorites` → 502 Bad Gateway  
- `GET /_next/image` → 502 Bad Gateway

## ✅ Yapılan Düzeltmeler

### 1. API Route'larına Timeout Koruması Eklendi

**Dosyalar:**
- `src/app/api/listings/user/route.ts`
- `src/app/api/listings/favorites/route.ts`

**Değişiklikler:**
- `withTimeout()` fonksiyonu eklendi (10 saniye timeout)
- Database sorguları timeout koruması ile sarıldı
- Timeout hatalarında 504 (Gateway Timeout) döndürülüyor
- Tüm hata durumlarında boş array (`listings: []`) döndürülüyor (frontend crash'i önlemek için)
- Response header'larına `Cache-Control: no-store` eklendi

### 2. Geliştirilmiş Hata Yönetimi

**Eklenen Hata Kontrolleri:**
- Timeout hataları (504 Gateway Timeout)
- Database bağlantı hataları (503 Service Unavailable)
- ECONNREFUSED hataları
- Genel hatalar (500 Internal Server Error)

**Tüm hatalarda:**
- Boş array döndürülüyor (`listings: []`)
- Uygun HTTP status kodları kullanılıyor
- Detaylı console log'ları eklendi

### 3. Teşhis Scripti Eklendi

**Dosya:** `502_DIAGNOSTIC.sh`

Bu script şunları kontrol eder:
- PM2 durumu ve restart sayısı
- Port 3000'in dinlenip dinlenmediği
- PM2 hata ve çıktı logları
- Nginx durumu ve error logları
- Database bağlantı testi
- Memory ve disk kullanımı
- `.next/prerender-manifest.json` varlığı
- Next.js uygulamasına manuel test

## 🚀 Kullanım

### 1. Dosyaları Sunucuya Yükle

```bash
# Windows'tan (PowerShell)
.\deploy.ps1
```

Veya manuel olarak:

```bash
# API route'larını yükle
scp src/app/api/listings/user/route.ts root@alo17.tr:/var/www/alo17/src/app/api/listings/user/route.ts
scp src/app/api/listings/favorites/route.ts root@alo17.tr:/var/www/alo17/src/app/api/listings/favorites/route.ts

# Teşhis scriptini yükle
scp 502_DIAGNOSTIC.sh root@alo17.tr:/var/www/alo17/502_DIAGNOSTIC.sh
```

### 2. Sunucuda Build ve Restart

```bash
cd /var/www/alo17

# Temiz build
rm -rf .next node_modules/.cache
npm install
npx prisma generate
npm run build

# PM2 restart
pm2 restart all
pm2 save
```

### 3. Teşhis Scriptini Çalıştır

```bash
cd /var/www/alo17
chmod +x 502_DIAGNOSTIC.sh
./502_DIAGNOSTIC.sh
```

## 🔧 Beklenen Sonuçlar

### Başarılı Durum:
- ✅ PM2 status: `online`
- ✅ Port 3000: `LISTEN`
- ✅ API endpoint'leri: `200 OK` veya `401 Unauthorized` (session yoksa)
- ✅ Timeout hataları: `504 Gateway Timeout` (502 yerine)
- ✅ Database hataları: `503 Service Unavailable` (502 yerine)

### Hata Durumları:
- `504 Gateway Timeout`: Request timeout (10 saniye içinde cevap verilmedi)
- `503 Service Unavailable`: Database bağlantı hatası
- `500 Internal Server Error`: Genel hata
- `401 Unauthorized`: Session yok

## 📊 Monitoring

### PM2 Logları İzleme:
```bash
pm2 logs alo17 --err --lines 50
pm2 logs alo17 --out --lines 50
```

### Nginx Error Logları:
```bash
tail -f /var/log/nginx/error.log
```

### 502 Hatalarını İzleme:
```bash
tail -f /var/log/nginx/access.log | grep " 502 "
```

## ⚠️ Önemli Notlar

1. **Timeout Süreleri:**
   - User lookup: 5 saniye
   - Listings query: 8 saniye
   - Toplam: ~10 saniye

2. **Fallback Mekanizması:**
   - Tüm hata durumlarında `listings: []` döndürülüyor
   - Frontend crash'i önleniyor
   - Kullanıcıya uygun hata mesajı gösterilebilir

3. **Cache Kontrolü:**
   - `Cache-Control: no-store` header'ı eklendi
   - API response'ları cache'lenmiyor
   - Her istekte fresh data alınıyor

4. **Database Connection Pool:**
   - Prisma connection pool otomatik yönetiliyor
   - `$disconnect()` çağrıları kaldırıldı
   - Connection pool bozulmuyor

## 🔄 Sorun Devam Ederse

1. **Teşhis scriptini çalıştırın:**
   ```bash
   ./502_DIAGNOSTIC.sh
   ```

2. **PM2 loglarını kontrol edin:**
   ```bash
   pm2 logs alo17 --err --lines 100
   ```

3. **Database bağlantısını test edin:**
   ```bash
   cd /var/www/alo17
   node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('OK')).catch(e => console.error('ERROR:', e));"
   ```

4. **Nginx timeout ayarlarını kontrol edin:**
   ```bash
   grep -A 5 "proxy.*timeout" /etc/nginx/sites-available/alo17.tr
   ```

5. **Memory kullanımını kontrol edin:**
   ```bash
   free -h
   pm2 monit
   ```

## 📝 Değişiklik Özeti

- ✅ Timeout koruması eklendi
- ✅ Geliştirilmiş hata yönetimi
- ✅ Boş array fallback mekanizması
- ✅ Cache-Control header'ları
- ✅ Teşhis scripti eklendi
- ✅ Deploy script güncellendi

