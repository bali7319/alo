#!/bin/bash
# Sunucu güncelleme komutu

ssh root@alo17.tr "cd /var/www/alo17 && git pull origin main && npm install --legacy-peer-deps && npx prisma generate && npm run build && pm2 restart alo17 && echo 'Sunucu guncellemesi tamamlandi'"
