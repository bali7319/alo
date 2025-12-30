#!/bin/bash
# Sunucuda build script

echo "🚀 Sunucuda build başlatılıyor..."

# Proje dizinine git
cd /var/www/alo17

# Cache'i temizle
echo "📦 Cache temizleniyor..."
rm -rf .next/cache
rm -rf .next

# Prisma client oluştur
echo "🔧 Prisma client oluşturuluyor..."
npx prisma generate

# Build yap
echo "🔨 Build yapılıyor (bu biraz zaman alabilir)..."
npm run build

# Build başarılı mı kontrol et
if [ $? -eq 0 ]; then
    echo "✅ Build başarılı!"
    
    # PM2 restart
    echo "🔄 PM2 restart ediliyor..."
    pm2 restart alo17
    
    # Log'ları göster
    echo "📋 Son log'lar:"
    pm2 logs alo17 --err --lines 10 --nostream
    
    echo "✅ Tüm işlemler tamamlandı!"
else
    echo "❌ Build başarısız! Lütfen hataları kontrol edin."
    exit 1
fi

