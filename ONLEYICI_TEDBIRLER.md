# 502 Hatasının Tekrar Olmaması İçin Önleyici Tedbirler

## 1. Otomatik Monitoring ve Alerting

### A. PM2 Monitoring
PM2 monitoring'i aktif edin:
```bash
ssh root@alo17.tr "pm2 install pm2-logrotate"
ssh root@alo17.tr "pm2 set pm2-logrotate:max_size 10M"
ssh root@alo17.tr "pm2 set pm2-logrotate:retain 7"
```

### B. Health Check Endpoint
Mevcut `/api/health` endpoint'i düzenli kontrol edilmeli.

### C. Cron Job ile Otomatik Kontrol
Her 5 dakikada bir site durumunu kontrol eden cron job.

## 2. PM2 Yapılandırma İyileştirmeleri

### Mevcut Ayarlar (ecosystem.config.js)
- ✅ `autorestart: true` - Aktif
- ✅ `max_memory_restart: '3G'` - Aktif
- ✅ `min_uptime: '10s'` - Aktif
- ✅ `max_restarts: 10` - Aktif

### Önerilen İyileştirmeler
1. **Restart Delay Artırma**
   - `restart_delay: 4000` → `restart_delay: 5000` (5 saniye)

2. **Max Restarts Artırma**
   - `max_restarts: 10` → `max_restarts: 15`

3. **Watch Mode (Development için)**
   - Production'da `watch: false` kalmalı

## 3. Otomatik Health Check Script

### Günlük Kontrol Script'i
`DAILY_CHECK.ps1` zaten mevcut, düzenli çalıştırılmalı.

### Otomatik Restart Script'i
Site erişilemezse otomatik restart yapan script.

## 4. Log Rotation ve Temizlik

### PM2 Log Rotation
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### Disk Temizliği
Düzenli disk temizliği script'i çalıştırılmalı.

## 5. Database Connection Pooling

### Prisma Connection Pool Ayarları
`prisma/schema.prisma` içinde connection pool ayarları optimize edilmeli.

## 6. Nginx Yapılandırma

### Timeout Ayarları
Mevcut timeout ayarları yeterli (120s).

### Buffer Ayarları
Mevcut buffer ayarları optimize edilmiş.

## 7. Monitoring Tools

### A. Uptime Monitoring
- UptimeRobot (ücretsiz)
- Pingdom
- StatusCake

### B. Application Monitoring
- PM2 Plus (ücretli)
- New Relic
- Datadog

## 8. Alerting Sistemi

### Email Alerting
Site down olduğunda email gönderen script.

### SMS Alerting (Opsiyonel)
Kritik durumlarda SMS gönderen sistem.

## 9. Otomatik Backup

### Database Backup
Düzenli database backup alınmalı.

### Code Backup
Git ile code backup zaten mevcut.

## 10. Performance Monitoring

### Memory Usage Tracking
Memory kullanımı düzenli takip edilmeli.

### CPU Usage Tracking
CPU kullanımı düzenli takip edilmeli.

### Disk Usage Tracking
Disk kullanımı düzenli takip edilmeli.

## Öncelikli Aksiyonlar

### 1. Hemen Yapılacaklar (Kritik)
- [ ] PM2 log rotation aktif edilmeli
- [ ] Günlük kontrol script'i düzenli çalıştırılmalı
- [ ] Health check endpoint'i düzenli kontrol edilmeli

### 2. Kısa Vadede (Önemli)
- [ ] Otomatik health check script'i kurulmalı
- [ ] Email alerting sistemi kurulmalı
- [ ] Disk temizliği otomatikleştirilmeli

### 3. Orta Vadede (İyileştirme)
- [ ] Uptime monitoring servisi kullanılmalı
- [ ] Application monitoring tool kurulmalı
- [ ] Database connection pool optimize edilmeli

### 4. Uzun Vadede (Optimizasyon)
- [ ] Load balancing (gerekirse)
- [ ] Auto-scaling (gerekirse)
- [ ] CDN kullanımı (gerekirse)

## Hızlı Kurulum Komutları

### PM2 Log Rotation
```bash
ssh root@alo17.tr "pm2 install pm2-logrotate && pm2 set pm2-logrotate:max_size 10M && pm2 set pm2-logrotate:retain 7 && pm2 set pm2-logrotate:compress true && pm2 save"
```

### Otomatik Health Check (Cron)
```bash
# Her 5 dakikada bir kontrol et
*/5 * * * * curl -f http://localhost:3000/api/health || pm2 restart alo17
```

### Disk Temizliği (Haftalık)
```bash
# Her Pazar gece 2'de temizlik yap
0 2 * * 0 /var/www/alo17/scripts/cleanup.sh
```

