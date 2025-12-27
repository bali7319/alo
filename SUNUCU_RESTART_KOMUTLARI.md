# Sunucuda PM2 Yeniden Başlatma Komutları

Build başarılı! Şimdi PM2'yi yeniden başlatın:

```bash
# PM2'yi yeniden başlat
pm2 restart alo17

# Durumu kontrol et
pm2 status

# Logları kontrol et (son 20 satır)
pm2 logs alo17 --lines 20

# Eğer hata varsa, detaylı loglar
pm2 logs alo17 --err --lines 50
```

## Hızlı Komut (Tek Satır)

```bash
pm2 restart alo17 && pm2 status && pm2 logs alo17 --lines 20
```

## Başarı Kontrolü

PM2 durumu şöyle görünmeli:

```
┌─────┬─────────┬─────────────┬─────────┬─────────┬──────────┐
│ id  │ name    │ mode        │ ↺       │ status  │ cpu      │
├─────┼─────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0   │ alo17   │ fork        │ 0       │ online  │ 0%       │
└─────┴─────────┴─────────────┴─────────┴─────────┴──────────┘
```

Status: **online** olmalı!

## Port Kontrolü

```bash
# Port 3000 dinleniyor mu?
netstat -tuln | grep :3000
# veya
ss -tuln | grep :3000
```

## Nginx Kontrolü

```bash
# Nginx durumu
systemctl status nginx

# Nginx logları
tail -f /var/log/nginx/error.log
```

## Son Kontrol

Tarayıcıda sitenizi açın ve 502 hatası gitti mi kontrol edin!

