@echo off
chcp 65001 >nul
echo Sunucudaki Prisma schema düzeltiliyor...
ssh root@alo17.tr "cd /var/www/alo17 && sed -i 's/provider = \"sqlite\"/provider = \"mysql\"/g' prisma/schema.prisma && npx prisma generate && npm run build && pm2 restart alo17"
pause
