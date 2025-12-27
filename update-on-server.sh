#!/bin/bash
# Sunucuya dosyayı kopyala, build al ve restart et

# 1. Dosyayı sunucuya kopyala (yerel bilgisayarınızda çalıştırın)
# scp src/app/ilanlar/page.tsx root@ns1:/var/www/alo17/src/app/ilanlar/page.tsx

# 2. Sunucuda build al ve restart et (SSH ile bağlanıp çalıştırın)
cd /var/www/alo17
npm run build
pm2 restart alo17
sleep 3
echo "Build tamamlandı ve PM2 restart edildi!"

