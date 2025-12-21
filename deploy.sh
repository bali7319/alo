#!/bin/bash

# Natro VPS Deployment Script
# Bu script projeyi production ortamına deploy etmek için kullanılır

set -e

echo "🚀 Alo17 Deployment Başlatılıyor..."

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Hata kontrolü
check_error() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Hata: $1${NC}"
        exit 1
    fi
}

# 1. Git pull
echo -e "${YELLOW}📥 Git güncellemesi yapılıyor...${NC}"
git pull origin main
check_error "Git pull başarısız"

# 2. Node modules kurulumu
echo -e "${YELLOW}📦 Bağımlılıklar kuruluyor...${NC}"
npm install --production
check_error "npm install başarısız"

# 3. Prisma client generate
echo -e "${YELLOW}🗄️ Prisma client generate ediliyor...${NC}"
npx prisma generate
check_error "Prisma generate başarısız"

# 4. Prisma migration
echo -e "${YELLOW}🔄 Veritabanı migration'ları çalıştırılıyor...${NC}"
npx prisma migrate deploy
check_error "Prisma migrate başarısız"

# 5. Build
echo -e "${YELLOW}🔨 Proje build ediliyor...${NC}"
npm run build
check_error "Build başarısız"

# 6. PM2 restart
echo -e "${YELLOW}🔄 PM2 yeniden başlatılıyor...${NC}"
pm2 restart alo17 || pm2 start ecosystem.config.js
check_error "PM2 restart başarısız"

# 7. PM2 save
pm2 save

echo -e "${GREEN}✅ Deployment tamamlandı!${NC}"
echo -e "${GREEN}📊 Durum kontrolü için: pm2 status${NC}"
echo -e "${GREEN}📝 Loglar için: pm2 logs alo17${NC}"

