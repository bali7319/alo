# 502 Bad Gateway Hatası - Çözüm Rehberi

## Olası Nedenler

1. **PM2 Process Durmuş**
   - Next.js uygulaması çökmüş olabilir
   - Process restart edilmeli

2. **Port 3000 Dinlemiyor**
   - Next.js uygulaması port 3000'de çalışmıyor
   - Port başka bir process tarafından kullanılıyor olabilir

3. **Nginx Yapılandırma Sorunu**
   - Nginx yanlış proxy_pass yapılandırması
   - Nginx servisi durmuş olabilir

4. **Sunucu Aşırı Yüklenmiş**
   - Memory/CPU limiti aşılmış
   - Disk dolmuş olabilir

5. **Database Bağlantı Sorunu**
   - Prisma client bağlantı hatası
   - Database erişilemiyor

## Hızlı Çözüm Komutları

### 1. PM2 Durumunu Kontrol Et
```bash
ssh root@alo17.tr "pm2 status"
```

### 2. PM2'yi Yeniden Başlat
```bash
ssh root@alo17.tr "cd /var/www/alo17 && pm2 restart alo17 && pm2 save"
```

### 3. Port 3000 Kontrolü
```bash
ssh root@alo17.tr "netstat -tlnp | grep 3000"
# VEYA
ssh root@alo17.tr "lsof -i :3000"
```

### 4. Nginx Durumunu Kontrol Et
```bash
ssh root@alo17.tr "systemctl status nginx"
```

### 5. Nginx Loglarını Kontrol Et
```bash
ssh root@alo17.tr "tail -50 /var/log/nginx/alo17-error.log"
```

### 6. PM2 Loglarını Kontrol Et
```bash
ssh root@alo17.tr "pm2 logs alo17 --lines 50 --nostream"
```

### 7. Sunucu Kaynak Kullanımı
```bash
ssh root@alo17.tr "free -h && df -h && top -bn1 | head -20"
```

### 8. Next.js Build Kontrolü
```bash
ssh root@alo17.tr "cd /var/www/alo17 && ls -la .next"
```

## Otomatik Çözüm Scripti

```bash
ssh root@alo17.tr "cd /var/www/alo17 && pm2 restart alo17 && pm2 save && systemctl reload nginx && sleep 3 && curl -I http://localhost:3000"
```

## Manuel Kontrol Adımları

1. **SSH ile sunucuya bağlan**
2. **PM2 durumunu kontrol et:** `pm2 status`
3. **Eğer process durmuşsa:** `cd /var/www/alo17 && pm2 restart alo17`
4. **Nginx'i kontrol et:** `systemctl status nginx`
5. **Port 3000'i kontrol et:** `netstat -tlnp | grep 3000`
6. **Logları kontrol et:** `pm2 logs alo17 --lines 50`
7. **Sunucuyu yeniden başlat (son çare):** `pm2 restart all && systemctl reload nginx`

## Önleyici Tedbirler

1. **PM2 Auto-restart:** `ecosystem.config.js` içinde `autorestart: true` olmalı
2. **Memory Limit:** `max_memory_restart: '3G'` ayarlı olmalı
3. **Health Check:** Düzenli health check endpoint'i kontrol edilmeli
4. **Monitoring:** PM2 monitoring aktif olmalı

## Acil Durum Komutu (Tek Satır)

```bash
ssh root@alo17.tr "cd /var/www/alo17 && pm2 restart alo17 && pm2 save && systemctl reload nginx"
```

