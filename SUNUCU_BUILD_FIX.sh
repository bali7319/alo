#!/bin/bash
# Sunucuda Build Sorunu Çözümü
# Bu script'i sunucuda çalıştırın: bash SUNUCU_BUILD_FIX.sh

echo "🔧 Build sorunu çözülüyor..."

cd /var/www/alo17

# 1. PM2'yi durdur
echo "⏹️  PM2 durduruluyor..."
pm2 stop alo17

# 2. .next klasörünü temizle
echo "🧹 .next klasörü temizleniyor..."
rm -rf .next

# 3. Cache temizle
echo "🧹 Cache temizleniyor..."
rm -rf node_modules/.cache

# 4. Bağımlılıkları kontrol et
echo "📦 Bağımlılıklar kontrol ediliyor..."
npm install

# 5. Prisma client'ı yeniden oluştur
echo "📦 Prisma client yeniden oluşturuluyor..."
npx prisma generate

# 6. Build yap
echo "🏗️  Build yapılıyor (bu biraz zaman alabilir)..."
npm run build

# 7. prerender-manifest.json kontrolü
echo ""
echo "📋 prerender-manifest.json kontrolü:"
if [ -f ".next/prerender-manifest.json" ]; then
    echo "✅ prerender-manifest.json oluşturuldu!"
    ls -lh .next/prerender-manifest.json
else
    echo "❌ HATA: prerender-manifest.json oluşturulamadı!"
    echo "Build loglarını kontrol edin: npm run build"
    exit 1
fi

# 8. PM2'yi başlat
echo ""
echo "🚀 PM2 başlatılıyor..."
pm2 start ecosystem.config.js

# 9. PM2'yi kaydet
pm2 save

# 10. Restart sayısını sıfırla
pm2 reset alo17

# 11. Durumu göster
echo ""
echo "📊 PM2 Durumu:"
pm2 status

echo ""
echo "📋 Son 20 log satırı:"
pm2 logs alo17 --lines 20 --nostream

echo ""
echo "✅ İşlem tamamlandı!"
echo "📊 Canlı logları izlemek için: pm2 logs alo17"

