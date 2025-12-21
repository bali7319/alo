# Build Bellek Sorunu Çözümü

## ❌ Sorun
```
Next.js build worker exited with code: null and signal: SIGKILL
```

Bu, bellek yetersizliği nedeniyle build işleminin sonlandırıldığını gösterir.

## ✅ Çözümler

### 1. Swap Dosyası Oluştur (Önerilen)
```bash
# Mevcut swap kontrolü
free -h

# 2GB swap dosyası oluştur
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Kalıcı yap
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab

# Kontrol et
free -h
```

### 2. Node.js Memory Limit Artır
```bash
cd /var/www/alo17

# Memory limit ile build
NODE_OPTIONS="--max-old-space-size=2048" npm run build
```

### 3. Build'i Parçalara Böl (Alternatif)
```bash
# Sadece Prisma generate
npx prisma generate

# Next.js build (memory limit ile)
NODE_OPTIONS="--max-old-space-size=2048" next build
```

### 4. PM2'yi Durdur (Build Sırasında)
```bash
# PM2'yi durdur (bellek boşaltmak için)
pm2 stop alo17

# Build yap
NODE_OPTIONS="--max-old-space-size=2048" npm run build

# PM2'yi tekrar başlat
pm2 start ecosystem.config.js
```

