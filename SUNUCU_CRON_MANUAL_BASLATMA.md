# Cron Servisi Manuel Başlatma

`ecosystem.config.js`'deki cron servisi otomatik başlamıyor. Manuel başlatma gerekiyor.

## Hızlı Çözüm

```bash
cd /var/www/alo17

# Cron servisini manuel başlat
pm2 start cron-server.js --name alo17-cron --log-date-format="YYYY-MM-DD HH:mm:ss Z"

# PM2'yi kaydet
pm2 save

# Durumu kontrol et
pm2 status
```

## Hata Kontrolü

Eğer başlatma sırasında hata alırsanız:

```bash
# Önce manuel çalıştırıp hatayı görün
cd /var/www/alo17
node cron-server.js
```

Bu komut hata mesajlarını gösterecektir.

## Log Kontrolü

```bash
# Cron servis logları
pm2 logs alo17-cron --lines 50

# Veya log dosyalarından
tail -f /var/www/alo17/logs/cron-out.log
tail -f /var/www/alo17/logs/cron-error.log
```

## Alternatif: Ecosystem Dosyasını Kontrol Et

```bash
# Ecosystem dosyasını kontrol et
cat ecosystem.config.js

# Eğer cron servisi yoksa, ekleyin veya manuel başlatın
```

