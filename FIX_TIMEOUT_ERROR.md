# Timeout Hatası Çözümü

## Sorun
- `ERR_TIMED_OUT` - Sunucu yanıt vermiyor
- RSC payload yüklenemiyor

## Çözüm Adımları

### 1. Sunucuda PM2 Durumunu Kontrol Et
```bash
ssh root@alo17.tr
pm2 status
pm2 logs alo17 --lines 50
```

### 2. PM2 Çalışmıyorsa Başlat
```bash
cd /var/www/alo17
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

### 3. Nginx Durumunu Kontrol Et
```bash
systemctl status nginx
nginx -t
```

### 4. .next Klasörünü Kontrol Et
```bash
cd /var/www/alo17
ls -lah .next
# Eğer .next yoksa veya bozuksa, yerel build'i aktar
```

### 5. Port 3000'i Kontrol Et
```bash
netstat -tlnp | grep 3000
# veya
ss -tlnp | grep 3000
```

### 6. Firewall Kontrolü
```bash
ufw status
# Port 3000 açık olmalı (Nginx proxy üzerinden)
```

### 7. Nginx Loglarını Kontrol Et
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### 8. PM2 Loglarını Kontrol Et
```bash
pm2 logs alo17 --err --lines 100
```

### 9. Eğer Build Eksikse, Yerel Build Aktar
Yerel bilgisayarda:
1. `.next` klasörünü ZIP'le
2. WinSCP ile `/var/www/alo17/` klasörüne yükle
3. Sunucuda:
```bash
cd /var/www/alo17
unzip -o .next.zip
chmod -R 755 .next
pm2 restart alo17
```

### 10. Nginx Yapılandırmasını Kontrol Et
```bash
cat /etc/nginx/sites-available/alo17
```

Nginx config'de şunlar olmalı:
- `proxy_pass http://localhost:3000;`
- `proxy_http_version 1.1;`
- `proxy_set_header` ayarları

