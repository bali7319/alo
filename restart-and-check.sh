#!/bin/bash
# PM2'yi restart et ve API'yi kontrol et

cd /var/www/alo17

echo "PM2 restart ediliyor..."
pm2 restart alo17

echo ""
echo "5 saniye bekleniyor..."
sleep 5

echo ""
echo "API'den ilanlar çekiliyor..."
curl -s "http://localhost:3000/api/listings?page=1&limit=5" | python3 -m json.tool 2>/dev/null || curl -s "http://localhost:3000/api/listings?page=1&limit=5"

echo ""
echo ""
echo "İşlem tamamlandı! Tarayıcıda hard refresh yapın (Ctrl+Shift+R)"

