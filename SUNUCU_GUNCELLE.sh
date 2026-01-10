#!/bin/bash
# Sunucu güncelleme scripti - Hukuki Belgeler ve Dilekçe sayfası için

cd /var/www/alo17

echo "📥 Git pull yapılıyor..."
git pull origin main

echo "📦 NPM paketleri yükleniyor..."
npm install --legacy-peer-deps

echo "🔧 Schema dosyası kontrol ediliyor..."
if grep -q 'provider = "sqlite"' prisma/schema.prisma; then
    echo "⚠️  Schema dosyası sqlite olarak görünüyor, postgresql'e çevriliyor..."
    sed -i 's/provider = "sqlite"/provider = "postgresql"/g' prisma/schema.prisma
    echo "✅ Schema dosyası güncellendi"
fi

echo "🔄 Prisma client generate ediliyor..."
npx prisma generate

echo "🏗️  Build yapılıyor..."
npm run build

echo "🔄 PM2 restart ediliyor..."
pm2 restart alo17

echo "✅ Sunucu güncellemesi tamamlandı!"
