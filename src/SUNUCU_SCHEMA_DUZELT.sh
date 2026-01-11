#!/bin/bash
# Sunucuda schema dosyasını düzeltmek için script

cd /var/www/alo17

echo "📥 Git pull yapılıyor..."
git pull origin main

echo "🔧 Schema dosyasını kontrol ediliyor..."
if [ -f "prisma/schema.prisma" ]; then
    echo "✅ Schema dosyası mevcut"
    # Schema dosyasının ilk satırlarını kontrol et
    if grep -q "# provider = \"postgresql\"" prisma/schema.prisma || grep -q "npm run build" prisma/schema.prisma; then
        echo "⚠️  Schema dosyası bozulmuş, git'ten restore ediliyor..."
        git checkout HEAD -- prisma/schema.prisma
        echo "✅ Schema dosyası restore edildi"
    fi
else
    echo "❌ Schema dosyası bulunamadı!"
    exit 1
fi

echo "🔄 Prisma client generate ediliyor..."
npx prisma generate

echo "🏗️  Build yapılıyor..."
npm run build

echo "🔄 PM2 restart ediliyor..."
pm2 restart alo17

echo "✅ Tamamlandı!"
