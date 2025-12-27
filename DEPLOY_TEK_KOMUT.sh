#!/bin/bash
# Tek komut deploy script

cd /var/www/alo17

# Cache'i temizle
rm -rf .next/cache
rm -rf .next

# Build
npm run build

# Restart
pm2 restart alo17

# Log'ları göster
pm2 logs alo17 --err --lines 20

