# 502 Bad Gateway Hatası Çözümü

## 🔍 Sorunun Nedeni

502 Bad Gateway hatası genellikle şu nedenlerden kaynaklanır:

1. **Prisma Connection Pool Sorunu**: API route'larında `$disconnect()` çağrıları connection pool'u bozuyordu
2. **Nginx Timeout Ayarları**: Nginx'in upstream (Next.js) sunucusuna bağlanma süresi çok kısaydı
3. **Database Connection Timeout**: Veritabanı bağlantı hataları düzgün handle edilmiyordu
4. **Uygulama Crash**: Hatalar yakalanmıyor ve uygulama çöküyordu

## ✅ Yapılan Düzeltmeler

### 1. Prisma Connection Pool Düzeltmesi

**Dosya**: `src/lib/prisma.ts`

- Connection pool otomatik yönetimi için global instance kullanımı
- Production'da da global instance tutulması (connection pool için kritik)
- Graceful shutdown için `beforeExit` handler eklendi

**ÖNEMLİ**: Artık API route'larında `$disconnect()` çağrısı YAPILMAMALI!

### 2. API Route'larında $disconnect() Kaldırıldı

Aşağıdaki dosyalarda `$disconnect()` çağrıları kaldırıldı:
- ✅ `src/app/api/listings/category/[slug]/route.ts`
- ✅ `src/app/api/moderator/listings/route.ts`
- ✅ `src/app/api/moderator/listings/[id]/route.ts`
- ✅ `src/app/api/listings/route.ts`
- ✅ `src/app/api/listings/my-listings/route.ts`

**Kalan dosyalar** (aynı düzeltmeyi uygulayın):
- `src/app/api/listings/user/route.ts`
- `src/app/api/payment/failed/route.ts`
- `src/app/api/career/route.ts`
- `src/app/api/career/[id]/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/user/limits/route.ts`
- `src/app/api/admin/listings/route.ts`
- `src/app/api/admin/users/route.ts`
- `src/app/api/admin/users/[id]/route.ts`
- `src/app/api/admin/listings/[id]/route.ts`

**Düzeltme Şablonu**:
```typescript
// ❌ YANLIŞ:
} finally {
  await prisma.$disconnect();
}

// ✅ DOĞRU:
}
// NOT: $disconnect() çağrısını kaldırdık - Prisma connection pool otomatik yönetir
```

### 3. Category Route Error Handling İyileştirildi

**Dosya**: `src/app/api/listings/category/[slug]/route.ts`

- Query timeout koruması eklendi (10 saniye uyarı)
- Database bağlantı hatası kontrolü eklendi
- Daha iyi HTTP status kodları (503 Service Unavailable)
- Production'da detaylı hata mesajları gizlendi

### 4. Nginx Configuration Template

**Dosya**: `nginx-site-config.conf`

Yeni nginx yapılandırması şunları içeriyor:
- ✅ Artırılmış timeout değerleri (60 saniye)
- ✅ Proxy buffer ayarları
- ✅ Retry mekanizması
- ✅ Health check ayarları
- ✅ Gzip compression

## 🚀 Sunucuda Uygulama Adımları

### 1. Nginx Yapılandırmasını Güncelle

```bash
# Mevcut yapılandırmayı yedekle
sudo cp /etc/nginx/sites-available/alo17.tr /etc/nginx/sites-available/alo17.tr.backup

# Yeni yapılandırmayı kopyala (nginx-site-config.conf dosyasını sunucuya yükleyin)
sudo nano /etc/nginx/sites-available/alo17.tr
# veya
sudo cp nginx-site-config.conf /etc/nginx/sites-available/alo17.tr

# Yapılandırmayı test et
sudo nginx -t

# Nginx'i yeniden yükle
sudo systemctl reload nginx
```

### 2. DATABASE_URL'i Güncelle (Connection Pool için)

`.env` dosyasında DATABASE_URL'e connection pool parametreleri ekleyin:

```bash
# Mevcut:
DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"

# Güncellenmiş (connection pool ile):
DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public&connection_limit=10&pool_timeout=20"
```

**Parametreler**:
- `connection_limit=10`: Maksimum 10 eşzamanlı bağlantı
- `pool_timeout=20`: Bağlantı bekleme süresi 20 saniye

### 3. Kodu Güncelle ve Build Et

```bash
cd /var/www/alo17

# Değişiklikleri çek (git kullanıyorsanız)
git pull
# veya dosyaları manuel yükleyin

# Bağımlılıkları kontrol et
npm install

# Prisma client'ı yeniden oluştur
npx prisma generate

# Build yap
npm run build
```

### 4. PM2'yi Yeniden Başlat

```bash
# PM2'yi yeniden başlat
pm2 restart alo17

# Durumu kontrol et
pm2 status

# Logları kontrol et
pm2 logs alo17 --lines 50
```

### 5. Kontroller

```bash
# Port 3000 dinleniyor mu?
ss -tuln | grep :3000

# Nginx durumu
systemctl status nginx

# Nginx error logları
tail -50 /var/log/nginx/alo17-error.log

# PM2 logları
pm2 logs alo17 --err --lines 50

# Localhost'tan test
curl http://localhost:3000
curl http://localhost:3000/api/listings/category/is
```

## 🔧 Sorun Giderme

### Hala 502 Hatası Alıyorsanız:

1. **PM2 Loglarını Kontrol Edin**:
   ```bash
   pm2 logs alo17 --err --lines 100
   ```

2. **Nginx Error Loglarını Kontrol Edin**:
   ```bash
   tail -100 /var/log/nginx/alo17-error.log
   ```

3. **Port 3000'i Kontrol Edin**:
   ```bash
   ss -tuln | grep :3000
   # Eğer görünmüyorsa, uygulama çalışmıyor demektir
   ```

4. **Database Bağlantısını Test Edin**:
   ```bash
   # PostgreSQL'e bağlan
   sudo -u postgres psql -d alo17_db
   # Bağlantı başarılıysa, \q ile çıkın
   ```

5. **PM2'yi Sıfırdan Başlatın**:
   ```bash
   pm2 delete alo17
   pm2 start ecosystem.config.js
   pm2 save
   ```

6. **Next.js'i Manuel Test Edin**:
   ```bash
   cd /var/www/alo17
   NODE_ENV=production PORT=3000 node_modules/.bin/next start
   # Başka bir terminal'de:
   curl http://localhost:3000
   ```

## 📊 Monitoring

502 hatalarını önlemek için düzenli kontrol edin:

```bash
# PM2 monitör (canlı izleme)
pm2 monit

# Nginx access log (hata oranlarını görmek için)
tail -f /var/log/nginx/alo17-access.log | grep " 502 "

# PM2 restart sayısını kontrol et (çok fazla restart = sorun var)
pm2 status
```

## ⚠️ Önemli Notlar

1. **$disconnect() Kullanmayın**: Prisma connection pool otomatik yönetir. Manuel disconnect connection pool'u bozar ve 502 hatalarına neden olur.

2. **Connection Pool Limitleri**: DATABASE_URL'de `connection_limit` parametresi ile sınırlayın. Çok yüksek değerler veritabanı kaynaklarını tüketir.

3. **Nginx Timeout**: 60 saniye yeterli olmalı. Daha uzun timeout'lar gerekiyorsa, uygulama performansını optimize edin.

4. **Error Handling**: Tüm API route'larında try-catch kullanın ve uygun HTTP status kodları döndürün.

5. **Logging**: Production'da detaylı hata mesajları göstermeyin, sadece loglara yazın.

## ✅ Başarı Kriterleri

- ✅ PM2 status: **online**
- ✅ Port 3000: **LISTEN**
- ✅ Nginx: **active (running)**
- ✅ Tarayıcıda: **502 hatası yok**
- ✅ API endpoint'leri: **200 OK**
- ✅ PM2 restart sayısı: **düşük (0-1)**

## 📞 Destek

Sorun devam ederse:
1. PM2 loglarını kontrol edin: `pm2 logs alo17 --err --lines 100`
2. Nginx error loglarını kontrol edin: `tail -100 /var/log/nginx/alo17-error.log`
3. Database bağlantısını test edin
4. Port 3000'in dinlendiğini doğrulayın

