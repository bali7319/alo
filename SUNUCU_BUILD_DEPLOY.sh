#!/bin/bash
# Sunucuda build ve deploy script

cd /var/www/alo17

echo "🛑 PM2 durduruluyor..."
pm2 stop alo17

echo "🧹 Cache temizleniyor..."
rm -rf .next
rm -rf .next/cache
rm -rf node_modules/.cache

echo "🔧 Prisma client oluşturuluyor..."
npx prisma generate

echo "🔨 Build yapılıyor (bu biraz zaman alabilir)..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build başarılı!"
    
    echo "🔄 PM2 başlatılıyor..."
    pm2 start alo17
    
    echo "⏳ 5 saniye bekleniyor..."
    sleep 5
    
    echo "📋 Son loglar:"
    pm2 logs alo17 --err --lines 20 --nostream
    
    echo "✅ Deploy tamamlandı!"
else
    echo "❌ Build başarısız! Lütfen hataları kontrol edin."
    exit 1
fi

