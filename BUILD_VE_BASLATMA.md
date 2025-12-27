# Build ve Başlatma Adımları

## ✅ Node.js 20 Kuruldu

- ✅ Node.js: v20.19.6
- ✅ npm: 10.8.2
- ✅ npm install: Başarılı

## 📋 Sonraki Adımlar

### 1. Prisma Client Oluştur

```bash
cd /var/www/alo17

# Prisma client oluştur
npx prisma generate
```

### 2. Veritabanı Migration

```bash
# Veritabanı migration
npx prisma migrate deploy
```

### 3. Build Yap

```bash
# Build yap (biraz zaman alabilir - 3-5 dakika)
npm run build
```

**Not:** Build işlemi biraz zaman alabilir. Sabırlı olun.

### 4. PM2 ile Başlat

```bash
# PM2 kurulu mu kontrol et
pm2 --version

# Eğer yoksa kur
npm install -g pm2

# PM2 ile başlat
pm2 start ecosystem.config.js

# PM2'yi kaydet
pm2 save

# PM2 startup (sunucu yeniden başladığında otomatik başlasın)
pm2 startup
```

### 5. Kontrol

```bash
# PM2 durumu
pm2 status

# PM2 logları
pm2 logs alo17 --lines 20

# Port kontrolü
netstat -tulpn | grep :3000
```

## 🎯 Hızlı Komutlar (Kopyala-Yapıştır)

SSH terminal'inde sırayla:

```bash
cd /var/www/alo17

# Prisma
npx prisma generate
npx prisma migrate deploy

# Build
npm run build

# PM2 kur (eğer yoksa)
npm install -g pm2

# PM2 başlat
pm2 start ecosystem.config.js
pm2 save

# Kontrol
pm2 status
pm2 logs alo17 --lines 20
```

