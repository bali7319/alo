#!/bin/bash
# CSS 404 hatasını düzeltmek için script

cd /var/www/alo17

echo "🧹 .next klasörü temizleniyor..."
rm -rf .next

echo "📦 NPM paketleri kontrol ediliyor..."
if [ -f package-lock.json ]; then
    npm ci --production=false
else
    npm install --include=dev
fi

echo "🏗️  Build yapılıyor..."
npm run build

echo "🔄 PM2 restart ediliyor..."
pm2 restart alo17

echo "✅ CSS sorunu düzeltildi!"
