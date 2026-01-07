# 502 Bad Gateway Hatası - Olası Nedenler ve Çözümler

## Dün Çalışan Site Bugün Neden 502 Veriyor?

### Olası Nedenler

#### 1. **PM2 Process Çökmüş**
- **Neden:** Memory limit aşımı, hata nedeniyle crash
- **Kontrol:** `pm2 status`
- **Çözüm:** `pm2 restart alo17`

#### 2. **Memory/CPU Limit Aşımı**
- **Neden:** Uzun süre çalışan process'ler memory leak yapabilir
- **Kontrol:** `free -h` ve `top`
- **Çözüm:** PM2 auto-restart ayarları kontrol edilmeli

#### 3. **Port 3000 Dinlemiyor**
- **Neden:** Process crash olmuş, port başka process tarafından kullanılıyor
- **Kontrol:** `netstat -tlnp | grep 3000`
- **Çözüm:** Process'i yeniden başlat

#### 4. **Database Bağlantı Sorunu**
- **Neden:** Prisma client bağlantı hatası, database erişilemiyor
- **Kontrol:** PM2 logları (`pm2 logs alo17`)
- **Çözüm:** Database bağlantısını kontrol et

#### 5. **Disk Dolmuş**
- **Neden:** Log dosyaları, cache, backup dosyaları disk'i doldurmuş
- **Kontrol:** `df -h`
- **Çözüm:** Disk temizliği yap

#### 6. **Next.js Build Hatası**
- **Neden:** Son deploy'da build hatası olmuş, .next klasörü bozulmuş
- **Kontrol:** `.next` klasörünü kontrol et
- **Çözüm:** Build'i yeniden yap

#### 7. **Nginx Yapılandırma Sorunu**
- **Neden:** Nginx restart olmuş, yapılandırma hatası
- **Kontrol:** `systemctl status nginx`
- **Çözüm:** Nginx'i yeniden başlat

#### 8. **Environment Variables Eksik**
- **Neden:** .env dosyası değişmiş, eksik değişkenler
- **Kontrol:** `.env` dosyasını kontrol et
- **Çözüm:** Eksik değişkenleri ekle

## Hızlı Teşhis Komutları

### 1. PM2 Durumu
```bash
ssh root@alo17.tr "pm2 status"
```

### 2. PM2 Logları (Son 50 satır)
```bash
ssh root@alo17.tr "pm2 logs alo17 --lines 50 --nostream"
```

### 3. Port 3000 Kontrolü
```bash
ssh root@alo17.tr "netstat -tlnp | grep 3000"
```

### 4. Memory/CPU Kullanımı
```bash
ssh root@alo17.tr "free -h && df -h && top -bn1 | head -20"
```

### 5. Nginx Durumu
```bash
ssh root@alo17.tr "systemctl status nginx"
```

### 6. Nginx Error Logları
```bash
ssh root@alo17.tr "tail -50 /var/log/nginx/alo17-error.log"
```

### 7. Disk Kullanımı
```bash
ssh root@alo17.tr "df -h"
```

### 8. Process Kontrolü
```bash
ssh root@alo17.tr "ps aux | grep node"
```

## Otomatik Çözüm (Tek Komut)

```bash
ssh root@alo17.tr "cd /var/www/alo17 && pm2 restart alo17 && pm2 save && systemctl reload nginx && sleep 3 && curl -I http://localhost:3000"
```

## Önleyici Tedbirler

### 1. PM2 Auto-Restart
- `ecosystem.config.js` içinde `autorestart: true` olmalı
- `max_memory_restart: '3G'` ayarlı olmalı

### 2. Health Check Endpoint
- `/api/health` endpoint'i düzenli kontrol edilmeli
- Monitoring tool kullanılmalı

### 3. Log Rotation
- PM2 log rotation aktif olmalı
- Eski loglar temizlenmeli

### 4. Disk Monitoring
- Disk kullanımı %80'i geçmemeli
- Düzenli temizlik yapılmalı

### 5. Database Connection Pooling
- Prisma connection pool ayarları optimize edilmeli
- Timeout ayarları kontrol edilmeli

## En Sık Görülen Nedenler (Sıralı)

1. **PM2 Process Crash** (%40)
2. **Memory Limit Aşımı** (%25)
3. **Database Bağlantı Sorunu** (%15)
4. **Disk Dolmuş** (%10)
5. **Nginx Sorunu** (%5)
6. **Diğer** (%5)

## Acil Durum Çözümü

```bash
# 1. PM2'yi yeniden başlat
ssh root@alo17.tr "cd /var/www/alo17 && pm2 restart alo17"

# 2. Nginx'i yeniden başlat
ssh root@alo17.tr "systemctl reload nginx"

# 3. Durumu kontrol et
ssh root@alo17.tr "pm2 status && curl -I http://localhost:3000"
```

