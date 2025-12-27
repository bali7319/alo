# Cron Job Kurulum Rehberi (Linux Sunucu)

## Süresi Dolan İlanların Otomatik Yayından Kaldırılması

Bu sistem, süresi dolan ilanları gece 00:02'de otomatik olarak yayından kaldırır.

## Kurulum Yöntemleri

### Yöntem 1: PM2 ile Cron Servisi (Önerilen)

PM2 ile ayrı bir cron servisi çalıştırılır. Bu yöntem daha güvenilir ve log takibi kolaydır.

#### Adım 1: Gerekli Paketleri Kur

```bash
cd /var/www/alo17
npm install node-cron
```

#### Adım 2: PM2 Ecosystem Dosyasını Güncelle

`ecosystem.config.js` dosyası zaten güncellenmiş durumda. İki servis çalışacak:
- `alo17`: Ana Next.js uygulaması
- `alo17-cron`: Cron job servisi

#### Adım 3: PM2'yi Yeniden Başlat

```bash
cd /var/www/alo17

# Mevcut servisleri durdur
pm2 stop all

# Yeni konfigürasyonla başlat
pm2 start ecosystem.config.js

# PM2'yi kaydet
pm2 save

# Durumu kontrol et
pm2 status
```

#### Adım 4: Logları Kontrol Et

```bash
# Cron servis logları
pm2 logs alo17-cron --lines 50

# Veya log dosyalarından
tail -f /var/www/alo17/logs/cron-out.log
tail -f /var/www/alo17/logs/cron-error.log
```

### Yöntem 2: Linux Crontab (Alternatif)

Eğer PM2 kullanmak istemiyorsanız, Linux crontab kullanabilirsiniz.

#### Adım 1: Crontab Dosyasını Düzenle

```bash
crontab -e
```

#### Adım 2: Cron Job Ekle

Aşağıdaki satırı ekleyin (her gün 00:02'de çalışır):

```cron
2 0 * * * curl -X GET "https://alo17.tr/api/cron/expire-listings?secret=YOUR_CRON_SECRET" > /dev/null 2>&1
```

**Not:** `YOUR_CRON_SECRET` kısmını `.env` dosyasındaki `CRON_SECRET` değeri ile değiştirin.

#### Adım 3: Crontab'ı Kaydet

Dosyayı kaydedin (`Ctrl+O`, `Enter`, `Ctrl+X`).

#### Adım 4: Crontab'ı Kontrol Et

```bash
crontab -l
```

### Yöntem 3: External Cron Service (En Basit)

Eğer sunucuda cron kurulumu yapmak istemiyorsanız, external bir cron service kullanabilirsiniz.

#### cron-job.org Kullanımı

1. [cron-job.org](https://cron-job.org) sitesine kaydolun
2. Yeni bir cron job oluşturun:
   - **URL:** `https://alo17.tr/api/cron/expire-listings?secret=YOUR_CRON_SECRET`
   - **Schedule:** Her gün 00:02 (Cron: `2 0 * * *`)
   - **Method:** GET
   - **Timezone:** Europe/Istanbul

#### EasyCron Kullanımı

1. [EasyCron](https://www.easycron.com) sitesine kaydolun
2. Yeni bir cron job oluşturun:
   - **URL:** `https://alo17.tr/api/cron/expire-listings?secret=YOUR_CRON_SECRET`
   - **Schedule:** Her gün 00:02

## Environment Variable

`.env` dosyanıza `CRON_SECRET` ekleyin:

```bash
cd /var/www/alo17
nano .env
```

Şu satırı ekleyin:

```env
CRON_SECRET=your-very-secure-random-secret-key-here
```

Güvenli bir secret key oluşturmak için:

```bash
openssl rand -base64 32
```

## Test Etme

### PM2 Servisi ile Test

```bash
cd /var/www/alo17
node -r ts-node/register src/cron/expire-listings.ts
```

### API Endpoint ile Test

```bash
curl -X GET "https://alo17.tr/api/cron/expire-listings?secret=YOUR_CRON_SECRET"
```

## Sorun Giderme

### PM2 Servisi Çalışmıyor

```bash
# Servis durumunu kontrol et
pm2 status

# Logları kontrol et
pm2 logs alo17-cron

# Servisi yeniden başlat
pm2 restart alo17-cron
```

### Cron Job Çalışmıyor

1. PM2 loglarını kontrol edin: `pm2 logs alo17-cron`
2. `CRON_SECRET` environment variable'ının doğru ayarlandığını kontrol edin
3. Veritabanı bağlantısını kontrol edin
4. Manuel test yapın: `node -r ts-node/register src/cron/expire-listings.ts`

### İlanlar Yayından Kaldırılmıyor

1. Cron servisinin çalıştığını kontrol edin: `pm2 status`
2. Logları kontrol edin: `pm2 logs alo17-cron --lines 100`
3. Veritabanında `expiresAt` tarihlerini kontrol edin
4. Veritabanında `isActive` değerlerini kontrol edin

## Önerilen Yöntem

**PM2 ile Cron Servisi** önerilir çünkü:
- ✅ Log takibi kolay
- ✅ Otomatik restart
- ✅ PM2 ile merkezi yönetim
- ✅ Hata durumunda bildirim alabilirsiniz

## Cron Schedule Formatı

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Haftanın günü (0-7, 0 ve 7 = Pazar)
│ │ │ └───── Ay (1-12)
│ │ └─────── Ayın günü (1-31)
│ └───────── Saat (0-23)
└─────────── Dakika (0-59)
```

Örnekler:
- `2 0 * * *` = Her gün 00:02'de
- `0 */6 * * *` = Her 6 saatte bir
- `0 0 * * 0` = Her Pazar 00:00'da

