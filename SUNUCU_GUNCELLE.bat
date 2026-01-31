@echo off
chcp 65001 >nul
echo Sunucuya bağlanılıyor ve güncelleniyor...
ssh -p 2222 root@alo17.tr "cd /var/www/alo17 && git pull origin main && npm run build && pm2 restart alo17"
pause
