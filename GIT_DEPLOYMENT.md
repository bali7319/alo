# Git ile Proje Deployment

## 📥 Projeyi Sunucuya Çekme

### 1. Proje Klasörüne Git
```bash
cd /var/www/alo17
```

### 2. Git Repository'den Çek
```bash
git clone https://github.com/bali7319/alo.git .
```

**Not**: Eğer klasör boş değilse, önce temizleyin:
```bash
cd /var/www/alo17
rm -rf * .* 2>/dev/null || true
git clone https://github.com/bali7319/alo.git .
```

### 3. .env Dosyası Oluştur
```bash
nano .env
```

İçerik:
```env
DATABASE_URL="postgresql://alo17_user:güçlü-şifre-buraya@localhost:5432/alo17_db?schema=public"
NEXTAUTH_URL="https://alo17.tr"
NEXTAUTH_SECRET="rastgele-32-karakter-string-buraya"
NODE_ENV="production"
PORT=3000
```

**NEXTAUTH_SECRET oluştur:**
```bash
openssl rand -base64 32
```

### 4. Bağımlılıkları Kur
```bash
npm install --production
```

### 5. Prisma Setup
```bash
npx prisma generate
npx prisma migrate deploy
```

### 6. Build
```bash
npm run build
```

### 7. PM2 ile Başlat
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔄 Güncelleme (Gelecekte)

Projeyi güncellemek için:
```bash
cd /var/www/alo17
git pull origin main
npm install --production
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart alo17
```

Veya `deploy.sh` scriptini kullanın:
```bash
cd /var/www/alo17
chmod +x deploy.sh
./deploy.sh
```

