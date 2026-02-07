@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Proje klasörü: %CD%
echo.
echo --- Git add, commit, push ---
git add -A
git commit -m "SEO: canonical, sitemap, redirects, noindex, tek sayfa"
git push origin main
echo.
echo --- Sunucuda güncelleme ---
ssh -p 2222 root@alo17.tr "cd /var/www/alo17 && git pull origin main && npm run build && pm2 restart alo17"
echo.
pause
