# Dosyalar Kopyalandı - Sonraki Adımlar

## ✅ Dosyalar Başarıyla Kopyalandı!

- ✅ `src/` klasörü kopyalandı
- ✅ `prisma/` klasörü kopyalandı
- ✅ `public/` klasörü kopyalandı
- ✅ Config dosyaları kopyalandı

## 📋 Sonraki Adımlar

### 1. Dosyaları Kontrol Et

SSH terminal'inde:

```bash
cd /var/www/alo17

# Dosyalar var mı kontrol et
ls -la

# Önemli klasörler var mı?
ls -la src/
ls -la prisma/
ls -la public/

# Dosya sayısını kontrol et
find src -type f | wc -l
```

### 2. .env Dosyası Oluştur

```bash
cd /var/www/alo17

# .env dosyası oluştur
nano .env
```

İçerik (şifreleri değiştirin!):

```env
DATABASE_URL="postgresql://alo17_user:güçlü-şifre-buraya@localhost:5432/alo17_db?schema=public"
NEXTAUTH_URL="https://alo17.tr"
NEXTAUTH_SECRET="rastgele-32-karakter-uzunluğunda-güçlü-string-buraya"
NODE_ENV="production"
PORT=3000
```

**NEXTAUTH_SECRET oluşturmak için:**
```bash
openssl rand -base64 32
```

**Dosyayı kaydet:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 3. PostgreSQL Veritabanı Oluştur

```bash
# PostgreSQL'e bağlan
sudo -u postgres psql
```

PostgreSQL shell'de:
```sql
-- Veritabanı oluştur
CREATE DATABASE alo17_db;

-- Kullanıcı oluştur (şifreyi değiştirin!)
CREATE USER alo17_user WITH ENCRYPTED PASSWORD 'güçlü-şifre-buraya';

-- Yetkileri ver
GRANT ALL PRIVILEGES ON DATABASE alo17_db TO alo17_user;

-- Çıkış
\q
```

### 4. Bağımlılıkları Kur ve Build Et

```bash
cd /var/www/alo17

# Bağımlılıkları kur
npm install

# Prisma client oluştur
npx prisma generate

# Veritabanı migration
npx prisma migrate deploy

# Build yap
npm run build
```

### 5. PM2 ile Başlat

```bash
cd /var/www/alo17

# PM2 ile başlat
pm2 start ecosystem.config.js

# PM2'yi kaydet
pm2 save

# PM2 startup
pm2 startup
```

### 6. Kontrol

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
# 1. Dosya kontrolü
cd /var/www/alo17
ls -la

# 2. .env oluştur (nano ile)
nano .env

# 3. PostgreSQL (ayrı komut)
sudo -u postgres psql

# 4. npm install ve build
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

# 5. PM2 başlat
pm2 start ecosystem.config.js
pm2 save

# 6. Kontrol
pm2 status
pm2 logs alo17 --lines 20
```

