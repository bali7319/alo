#!/bin/bash
# 405 hatasını düzeltmek için

cd /var/www/alo17

echo "1. .next klasörünü temizliyoruz..."
rm -rf .next

echo "2. node_modules/.cache temizleniyor..."
rm -rf node_modules/.cache

echo "3. Yeniden build alınıyor..."
npm run build

echo "4. PM2 restart ediliyor..."
pm2 restart alo17

echo "5. 5 saniye bekleniyor..."
sleep 5

echo "6. API test ediliyor..."
curl -s http://localhost:3000/api/listings?page=1&limit=5 | head -20

echo ""
echo "İşlem tamamlandı!"

