# PM2 Log Kontrolü - 260 Restart Sorunu

## ⚠️ Sorun Tespiti

PM2'de **260 restart** görünüyor. Bu çok yüksek ve sürekli crash olduğunu gösteriyor.

## 🔍 Hemen Kontrol Edin

Sunucuda şu komutları çalıştırın:

```bash
# 1. PM2 error loglarını kontrol et (son 100 satır)
pm2 logs alo17 --err --lines 100

# 2. PM2 tüm logları kontrol et
pm2 logs alo17 --lines 50

# 3. PM2 detaylı bilgi
pm2 info alo17

# 4. PM2 monitör (canlı izleme - Ctrl+C ile çıkın)
pm2 monit
```

## 🔧 Olası Nedenler ve Çözümler

### 1. Database Bağlantı Hatası

**Kontrol:**
```bash
# .env dosyasını kontrol et
cat /var/www/alo17/.env | grep DATABASE_URL

# PostgreSQL bağlantısını test et
sudo -u postgres psql -d alo17_db -c "SELECT 1;"
```

**Çözüm:**
- DATABASE_URL'in doğru olduğundan emin olun
- PostgreSQL servisinin çalıştığını kontrol edin: `systemctl status postgresql`

### 2. Memory Limit Aşımı

**Kontrol:**
```bash
# Memory kullanımını kontrol et
pm2 info alo17 | grep memory
free -h
```

**Çözüm:**
- `ecosystem.config.js` dosyasında `max_memory_restart: '1G'` var, bu yeterli olmalı
- Eğer yeterli değilse artırın veya memory leak olup olmadığını kontrol edin

### 3. Port 3000 Zaten Kullanılıyor

**Kontrol:**
```bash
# Port 3000'i kontrol et
ss -tuln | grep :3000
lsof -i :3000
```

**Çözüm:**
- Eğer başka bir process port 3000'i kullanıyorsa, onu durdurun
- Veya PM2'yi sıfırdan başlatın

### 4. Prisma Client Hatası

**Kontrol:**
```bash
# Prisma client'ı kontrol et
cd /var/www/alo17
ls -la node_modules/.prisma/client/
```

**Çözüm:**
```bash
# Prisma client'ı yeniden oluştur
npx prisma generate
npm run build
pm2 restart alo17
```

### 5. Environment Variables Eksik

**Kontrol:**
```bash
# .env dosyasını kontrol et
cat /var/www/alo17/.env
```

**Çözüm:**
- Tüm gerekli environment variable'ların olduğundan emin olun:
  - DATABASE_URL
  - NEXTAUTH_URL
  - NEXTAUTH_SECRET
  - NODE_ENV=production

## 🚀 Hızlı Çözüm (Sıfırdan Başlatma)

```bash
cd /var/www/alo17

# PM2'yi durdur
pm2 delete alo17

# Prisma client'ı yeniden oluştur
npx prisma generate

# Build yap
npm run build

# PM2'yi sıfırdan başlat
pm2 start ecosystem.config.js

# PM2'yi kaydet
pm2 save

# Durumu kontrol et
pm2 status
pm2 logs alo17 --lines 20
```

## 📊 Monitoring

Restart sayısını sıfırlamak için:
```bash
pm2 reset alo17
```

Sonra logları izleyin:
```bash
pm2 logs alo17 --lines 0
```

## ✅ Başarı Kriterleri

- ✅ PM2 restart sayısı: **0-1** (çok düşük olmalı)
- ✅ PM2 status: **online**
- ✅ Memory kullanımı: **stabil** (sürekli artmıyor)
- ✅ CPU kullanımı: **normal** (<100%)
- ✅ Port 3000: **LISTEN**

## 🔍 Detaylı Debug

Eğer sorun devam ederse:

```bash
# 1. PM2 loglarını dosyaya kaydet
pm2 logs alo17 --err --lines 200 > /tmp/pm2-errors.log

# 2. Node.js'i manuel çalıştır (hata mesajlarını görmek için)
cd /var/www/alo17
NODE_ENV=production PORT=3000 node_modules/.bin/next start

# 3. System loglarını kontrol et
journalctl -u pm2-root -n 50
```

