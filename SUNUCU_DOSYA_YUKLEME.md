# Cron Server Dosyasını Sunucuya Yükleme

`cron-server.js` dosyası sunucuda yok. Dosyayı yüklemek için:

## Yöntem 1: Deploy Script ile (Önerilen)

Yerel bilgisayarda:

```powershell
.\deploy.ps1
```

Bu script `cron-server.js` ve `ecosystem.config.js` dosyalarını da yükleyecek.

## Yöntem 2: Manuel SCP ile

Yerel bilgisayarda (PowerShell veya Git Bash):

```bash
# Cron server dosyasını yükle
scp cron-server.js root@alo17.tr:/var/www/alo17/cron-server.js

# Ecosystem config'i yükle
scp ecosystem.config.js root@alo17.tr:/var/www/alo17/ecosystem.config.js
```

## Yöntem 3: WinSCP ile

1. WinSCP'yi açın
2. Sunucuya bağlanın
3. `cron-server.js` dosyasını `/var/www/alo17/` klasörüne sürükleyin
4. `ecosystem.config.js` dosyasını da güncelleyin

## Dosya Yüklendikten Sonra

Sunucuda:

```bash
cd /var/www/alo17

# Dosyanın varlığını kontrol et
ls -la cron-server.js

# Manuel test
node cron-server.js

# PM2 ile başlat
pm2 start cron-server.js --name alo17-cron --log-date-format="YYYY-MM-DD HH:mm:ss Z"

# PM2'yi kaydet
pm2 save

# Durumu kontrol et
pm2 status
```

