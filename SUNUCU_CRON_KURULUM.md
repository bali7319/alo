# Sunucuda Cron Job Kurulumu

## Durum
PM2'de `alo17-cron` servisi görünmüyor. Manuel başlatma gerekiyor.

## Hızlı Çözüm

### 1. Cron Servisini Manuel Başlat

```bash
cd /var/www/alo17

# Cron servisini başlat
pm2 start cron-server.js --name alo17-cron

# PM2'yi kaydet
pm2 save

# Durumu kontrol et
pm2 status
```

### 2. Logları Kontrol Et

```bash
# Cron servis logları
pm2 logs alo17-cron

# Veya log dosyalarından
tail -f /var/www/alo17/logs/cron-out.log
tail -f /var/www/alo17/logs/cron-error.log
```

### 3. Test Et

Cron job'un çalışıp çalışmadığını test etmek için:

```bash
# Manuel test (cron job'u hemen çalıştır)
node -e "
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const now = new Date();
  const expired = await prisma.listing.findMany({
    where: { isActive: true, expiresAt: { lt: now } },
    select: { id: true, title: true }
  });
  console.log('Süresi dolmuş ilan sayısı:', expired.length);
  await prisma.\$disconnect();
}
test();
"
```

## Sorun Giderme

### Cron Servisi Başlamıyor

1. **Logları kontrol edin:**
   ```bash
   pm2 logs alo17-cron --lines 50
   ```

2. **Manuel çalıştırın:**
   ```bash
   cd /var/www/alo17
   node cron-server.js
   ```
   
   Hata mesajlarını kontrol edin.

3. **Gerekli paketlerin kurulu olduğunu kontrol edin:**
   ```bash
   npm list node-cron @prisma/client
   ```

### Cron Job Çalışmıyor

1. **Zamanı kontrol edin:**
   - Cron job her gün 00:02'de çalışacak
   - Test için schedule'ı değiştirebilirsiniz: `'*/5 * * * *'` (her 5 dakikada bir)

2. **Manuel test:**
   ```bash
   # expireListings fonksiyonunu manuel çağır
   node -e "
   require('./cron-server.js');
   setTimeout(() => {
     // expireListings fonksiyonunu çağır
   }, 2000);
   "
   ```

## Alternatif: Linux Crontab

PM2 ile sorun yaşıyorsanız, Linux crontab kullanabilirsiniz:

```bash
# Crontab düzenle
crontab -e

# Şu satırı ekleyin (her gün 00:02'de)
2 0 * * * curl -X GET "https://alo17.tr/api/cron/expire-listings?secret=YOUR_CRON_SECRET" > /dev/null 2>&1

# Kaydet ve çık
```

**Not:** `YOUR_CRON_SECRET` kısmını `.env` dosyasındaki `CRON_SECRET` değeri ile değiştirin.

## PM2 Ecosystem Güncelleme

Eğer `ecosystem.config.js` dosyası güncellenmişse:

```bash
cd /var/www/alo17

# Tüm servisleri durdur
pm2 stop all
pm2 delete all

# Yeni konfigürasyonla başlat
pm2 start ecosystem.config.js

# Kaydet
pm2 save

# Durumu kontrol et
pm2 status
```

İki servis görünmeli:
- `alo17` (ana uygulama)
- `alo17-cron` (cron job servisi)

