@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo 1. desktop-kakeibo/release Git'ten cikariliyor...
echo ============================================
git rm -r --cached desktop-kakeibo/release
if errorlevel 1 (
  echo Uyari: desktop-kakeibo/release zaten index'te yok veya hata olustu.
  echo Devam ediliyor...
)

echo.
echo ============================================
echo 2. .gitignore degisikligi ekleniyor...
echo ============================================
git add desktop-kakeibo/.gitignore

echo.
echo ============================================
echo 3. Son commit duzeltiliyor (amend)...
echo ============================================
git commit --amend --no-edit

echo.
echo ============================================
echo 4. Push (origin main)...
echo ============================================
git push origin main

echo.
echo Bitti. Hata yoksa sunucuda guncellemek icin:
echo   ssh -p 2222 root@alo17.tr "cd /var/www/alo17 && git pull origin main && npm run build && pm2 restart alo17"
pause
