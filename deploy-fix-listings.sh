#!/bin/bash
# Demo ilanlar sorununu düzeltmek için deployment scripti

echo "=========================================="
echo "İlanlar API düzeltmesi - Deployment"
echo "=========================================="

cd /var/www/alo17 || exit 1

echo ""
echo "1. Mevcut dosyaları yedekle..."
cp src/app/api/listings/route.ts src/app/api/listings/route.ts.backup
cp src/app/ilanlar/page.tsx src/app/ilanlar/page.tsx.backup

echo ""
echo "2. Next.js cache'i temizle..."
rm -rf .next

echo ""
echo "3. Node modules kontrolü..."
npm install

echo ""
echo "4. Build alınıyor..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build başarısız!"
    exit 1
fi

echo ""
echo "5. PM2'yi yeniden başlat..."
pm2 restart alo17

echo ""
echo "6. PM2 loglarını kontrol et..."
sleep 2
pm2 logs alo17 --lines 20 --nostream

echo ""
echo "=========================================="
echo "✅ Deployment tamamlandı!"
echo "=========================================="
echo ""
echo "Test için:"
echo "  curl -v http://localhost:3000/api/listings?page=1&limit=10"
echo ""

