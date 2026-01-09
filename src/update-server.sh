#!/bin/bash
# Sunucu güncelleme scripti

cd /var/www/alo17
git pull origin main
npm install --legacy-peer-deps
npm run build
pm2 restart alo17

echo "✅ Sunucu güncellemesi tamamlandı!"
