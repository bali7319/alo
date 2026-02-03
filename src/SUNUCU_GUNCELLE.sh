#!/bin/bash
# Sunucu güncelleme scripti - Hukuki Belgeler ve Dilekçe sayfası için

cd /var/www/alo17

echo "📥 Git pull yapılıyor..."
git fetch origin main
git reset --hard origin/main
git clean -fd -e public/uploads -e public/images/listings

echo "📦 NPM paketleri yükleniyor..."
if [ -f package-lock.json ]; then
    npm ci --production=false
else
    npm install --include=dev
fi

echo "🔄 Prisma client generate ediliyor..."
npx prisma generate

echo "🏗️  Build yapılıyor..."
npm run build

echo "🔄 PM2 restart ediliyor..."
pm2 restart alo17

echo "✅ Sunucu güncellemesi tamamlandı!"
