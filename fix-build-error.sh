#!/bin/bash
# Build hatası düzeltme script'i

echo "🔧 Build hatası düzeltiliyor..."

cd /var/www/alo17

# PM2'yi durdur
echo "⏸️  PM2 durduruluyor..."
pm2 stop alo17

# .next klasörünü tamamen temizle
echo "🧹 .next klasörü temizleniyor..."
rm -rf .next
rm -rf .next/cache

# Prisma client oluştur
echo "🔧 Prisma client oluşturuluyor..."
npx prisma generate

# Build yap
echo "🔨 Build yapılıyor (bu biraz zaman alabilir)..."
npm run build

# Build başarılı mı kontrol et
if [ $? -eq 0 ]; then
    echo "✅ Build başarılı!"
    
    # PM2'yi başlat
    echo "🔄 PM2 başlatılıyor..."
    pm2 start alo17
    
    # Log'ları göster
    echo "📋 Son log'lar:"
    sleep 2
    pm2 logs alo17 --err --lines 10 --nostream
else
    echo "❌ Build başarısız! Lütfen hataları kontrol edin."
    exit 1
fi

echo "✅ İşlem tamamlandı!"

