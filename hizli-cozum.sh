#!/bin/bash
# PM2 260 Restart Sorunu - Hızlı Çözüm

echo "🔍 PM2 Log Kontrolü..."
pm2 logs alo17 --err --lines 20

echo ""
echo "🔄 PM2'yi sıfırdan başlatılıyor..."
cd /var/www/alo17

# PM2'yi durdur
pm2 delete alo17

# Prisma client'ı yeniden oluştur
echo "📦 Prisma client yeniden oluşturuluyor..."
npx prisma generate

# Build yap
echo "🏗️  Build yapılıyor..."
npm run build

# PM2'yi sıfırdan başlat
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

