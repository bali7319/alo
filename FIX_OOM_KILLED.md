# OOM (Out of Memory) Sorunu Çözümü

## ❌ Sorun
Her komut "Killed" hatası veriyor - bu OOM Killer'ın süreçleri sonlandırdığını gösterir.

## ✅ Çözümler

### 1. Durum Kontrolü
```bash
# Bellek kullanımı
free -h

# En çok bellek kullanan süreçler
ps aux --sort=-%mem | head -10

# Swap durumu
swapon --show

# PM2 durumu
pm2 list
```

### 2. PM2'yi Tamamen Durdur
```bash
# PM2'yi tamamen kapat
pm2 kill

# Veya systemctl ile
systemctl stop pm2-root
```

### 3. Build'i Yerel Makinede Yap (Önerilen)
Yerel makinede build yapıp sunucuya yükle:

**Yerel makinede:**
```bash
npm run build
tar -czf build.tar.gz .next
scp build.tar.gz root@alo17.tr:/var/www/alo17/
```

**Sunucuda:**
```bash
cd /var/www/alo17
tar -xzf build.tar.gz
pm2 restart alo17
```

### 4. Daha Küçük Memory Limit ile Dene
```bash
# PM2'yi kapat
pm2 kill

# Çok düşük limit ile dene
NODE_OPTIONS="--max-old-space-size=1024" npm run build
```

### 5. Build'i Parçalara Böl
```bash
# Sadece Prisma
npx prisma generate

# Next.js build (standalone mode - daha az bellek)
NODE_OPTIONS="--max-old-space-size=1024" next build --experimental-build-mode=compile
```

