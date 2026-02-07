@echo off
chcp 65001 >nul
echo ============================================
echo  1. Önce değişiklikleri push edin:
echo     git add -A
echo     git commit -m "SEO: canonical, sitemap, redirects, noindex"
echo     git push origin main
echo ============================================
echo.
echo Sunucuya bağlanılıyor ve güncelleniyor (pull + build + pm2 restart)...
ssh -p 2222 root@alo17.tr "cd /var/www/alo17 && git pull origin main && npm run build && pm2 restart alo17"
echo.
pause
