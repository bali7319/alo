# Sunucu Kurulum Adımları - SSH Bağlantısı Başarılı

## ✅ Bağlantı Başarılı!

SSH ile bağlandınız. Şimdi sunucuyu kurmaya başlayalım.

## 📋 Adım Adım Kurulum

### 1. Proje Klasörünü Kontrol Et

```bash
# Proje klasörüne git
cd /var/www/alo17

# Klasör var mı kontrol et
ls -la
```

### 2. Eğer Klasör Boşsa veya Yoksa

```bash
# Klasör oluştur
mkdir -p /var/www/alo17
cd /var/www/alo17

# Temel klasör yapısını oluştur
mkdir -p src/app/api
mkdir -p src/components
mkdir -p src/lib
mkdir -p prisma
mkdir -p public/images
```

### 3. Dosyaları Yerelden Sunucuya Kopyala

**Windows PowerShell'den (yeni bir terminal açın):**

```powershell
# Önemli dosyaları kopyala
cd C:\Users\bali\Desktop\alo

# Tüm src klasörünü kopyala
scp -r src root@alo17.tr:/var/www/alo17/

# Prisma klasörünü kopyala
scp -r prisma root@alo17.tr:/var/www/alo17/

# Public klasörünü kopyala
scp -r public root@alo17.tr:/var/www/alo17/

# Config dosyalarını kopyala
scp package.json root@alo17.tr:/var/www/alo17/
scp package-lock.json root@alo17.tr:/var/www/alo17/
scp next.config.js root@alo17.tr:/var/www/alo17/
scp tsconfig.json root@alo17.tr:/var/www/alo17/
scp tailwind.config.js root@alo17.tr:/var/www/alo17/
scp postcss.config.js root@alo17.tr:/var/www/alo17/
scp ecosystem.config.js root@alo17.tr:/var/www/alo17/
```

**VEYA WinSCP ile:**
- WinSCP'yi açın
- Sol: `C:\Users\bali\Desktop\alo`
- Sağ: `/var/www/alo17`
- Tüm klasörleri sürükle-bırak (node_modules hariç)

### 4. Sunucuda .env Dosyası Oluştur

**SSH terminal'inde:**

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

### 5. PostgreSQL Veritabanı Oluştur

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

### 6. Bağımlılıkları Kur ve Build Et

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

### 7. PM2 ile Başlat

```bash
cd /var/www/alo17

# PM2 ile başlat
pm2 start ecosystem.config.js

# PM2'yi kaydet
pm2 save

# PM2 startup
pm2 startup
```

### 8. Kontrol

```bash
# PM2 durumu
pm2 status

# PM2 logları
pm2 logs alo17 --lines 20

# Port kontrolü
netstat -tulpn | grep :3000
```

## 🎯 Hızlı Komutlar (Kopyala-Yapıştır)

SSH terminal'inde sırayla çalıştırın:

```bash
# 1. Klasör kontrolü
cd /var/www/alo17
ls -la

# 2. Dosyalar yüklendikten sonra
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

# 3. PM2 başlat
pm2 start ecosystem.config.js
pm2 save

# 4. Kontrol
pm2 status
pm2 logs alo17 --lines 20
```

## 📝 Notlar

1. **Dosyaları kopyalarken** `node_modules` ve `.next` klasörlerini atlayın
2. **.env dosyasını** sunucuda oluşturun (yerelden kopyalamayın)
3. **PostgreSQL şifresini** .env dosyasındaki şifreyle eşleştirin
4. **Build işlemi** biraz zaman alabilir

