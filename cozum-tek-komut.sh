#!/bin/bash
# Prerender Manifest ve Cache Sorunu - Tek Komut Çözümü

echo "🔧 Prerender Manifest ve Cache Sorunu Çözülüyor..."

cd /var/www/alo17

# PM2'yi durdur
echo "⏹️  PM2 durduruluyor..."
pm2 delete alo17

# .next klasörünü temizle
echo "🧹 .next klasörü temizleniyor..."
rm -rf .next

# Cache temizle
echo "🧹 Cache temizleniyor..."
rm -rf node_modules/.cache

# Prisma client'ı yeniden oluştur
echo "📦 Prisma client yeniden oluşturuluyor..."
npx prisma generate

# Build yap
echo "🏗️  Build yapılıyor..."
npm run build

# prerender-manifest.json kontrolü
echo ""
echo "📋 prerender-manifest.json kontrolü:"
if [ -f ".next/prerender-manifest.json" ]; then
    echo "✅ prerender-manifest.json oluşturuldu!"
    ls -lh .next/prerender-manifest.json
else
    echo "❌ HATA: prerender-manifest.json oluşturulamadı!"
    exit 1
fi

# PM2'yi başlat
echo ""
echo "🚀 PM2 başlatılıyor..."
pm2 start ecosystem.config.js

# PM2'yi kaydet
pm2 save

# Restart sayısını sıfırla
pm2 reset alo17

# Durumu göster
echo ""
echo "📊 PM2 Durumu:"
pm2 status

echo ""
echo "📋 Son 20 log satırı:"
pm2 logs alo17 --lines 20 --nostream

echo ""
echo "✅ İşlem tamamlandı!"
echo "📊 Canlı logları izlemek için: pm2 logs alo17"

