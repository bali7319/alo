#!/bin/bash
# Sunucu güncelleme komutu

ssh -p 2222 root@alo17.tr "set -euo pipefail; cd /var/www/alo17; echo '📥 Git sync...'; git fetch origin main; git reset --hard origin/main; git clean -fd -e public/uploads -e public/images/listings; echo '📦 NPM (deterministic) install...'; if [ -f package-lock.json ]; then npm ci --production=false; else npm install --include=dev; fi; echo '🔧 Prisma generate...'; npx prisma generate; echo '🏗️ Build...'; npm run build; echo '🔄 PM2 restart...'; pm2 restart alo17; pm2 save; echo '✅ Sunucu guncellemesi tamamlandi'"
