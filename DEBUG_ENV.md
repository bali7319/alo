# .env Dosyası Debug

## Kontrol Adımları

### 1. .env Dosyasını Kontrol Et
```bash
cat .env
```

### 2. .env Dosyasının Konumunu Kontrol Et
```bash
pwd
ls -la .env
```

### 3. Prisma'nın Hangi .env Dosyasını Okuduğunu Kontrol Et
```bash
cd /var/www/alo17
cat .env | grep DATABASE_URL
```

### 4. Environment Variable'ı Manuel Set Et ve Test Et
```bash
export DATABASE_URL="postgresql://alo17_user:20251973Bscc7319@localhost:5432/alo17_db?schema=public"
echo $DATABASE_URL
npx prisma db push
```

### 5. .env Dosyasını Yeniden Oluştur
```bash
cd /var/www/alo17
rm .env
cat > .env << 'EOF'
DATABASE_URL="postgresql://alo17_user:20251973Bscc7319@localhost:5432/alo17_db?schema=public"
NEXTAUTH_URL="https://alo17.tr"
NEXTAUTH_SECRET="ZJsjIWDL0CCuMmAy2r8by1mQG+S+DVPaMPYcBfAzglw="
NODE_ENV="production"
PORT=3000
EOF

# Kontrol et
cat .env

# Tekrar dene
npx prisma db push
```

