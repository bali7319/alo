# SSH ile Sunucuda Güncelleme - Tek Komut
# PowerShell'de çalıştır: ssh root@alo17.tr "cd /var/www/alo17 && git pull origin main && rm -rf .next && npx prisma generate && npm run build && pm2 restart alo17 && pm2 logs alo17 --err --lines 20 --nostream"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Sunucuda Güncelleme Başlatılıyor..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

ssh root@alo17.tr "cd /var/www/alo17 && echo '1. Git pull yapılıyor...' && git pull origin main && echo '2. Cache temizleniyor...' && rm -rf .next && echo '3. Prisma generate yapılıyor...' && npx prisma generate && echo '4. Build yapılıyor...' && npm run build && echo '5. PM2 restart yapılıyor...' && pm2 restart alo17 && echo '6. Log kontrol ediliyor...' && pm2 logs alo17 --err --lines 20 --nostream"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Güncelleme Tamamlandı!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test: https://alo17.tr" -ForegroundColor Yellow

