#!/bin/bash
# Build ve middleware-manifest.json kontrolü

cd /var/www/alo17

echo "🔍 Build dosyalarını kontrol ediliyor..."

# .next klasörü var mı?
if [ ! -d ".next" ]; then
    echo "❌ .next klasörü yok! Build yapılmalı."
    exit 1
fi

# middleware-manifest.json var mı?
if [ ! -f ".next/server/middleware-manifest.json" ]; then
    echo "⚠️  middleware-manifest.json eksik! Temiz build yapılmalı."
    echo "🧹 .next klasörü temizleniyor..."
    rm -rf .next
    echo "🏗️  Yeni build yapılıyor..."
    npm run build
else
    echo "✅ middleware-manifest.json mevcut"
    ls -lh .next/server/middleware-manifest.json
fi

# prerender-manifest.json var mı?
if [ ! -f ".next/prerender-manifest.json" ]; then
    echo "⚠️  prerender-manifest.json eksik!"
else
    echo "✅ prerender-manifest.json mevcut"
fi

echo ""
echo "📊 PM2 restart ediliyor..."
pm2 restart alo17

echo ""
echo "📋 Son loglar:"
pm2 logs alo17 --lines 10 --nostream

