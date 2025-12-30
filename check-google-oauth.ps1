# Google OAuth Kontrol Scripti
Write-Host "`n=== Google OAuth Kontrol ===`n" -ForegroundColor Cyan

Write-Host "1. Sunucudaki environment variable'lar kontrol ediliyor..." -ForegroundColor Yellow
ssh root@alo17.tr "cd /var/www/alo17 && echo 'GOOGLE_CLIENT_ID:' && grep GOOGLE_CLIENT_ID .env | cut -d'=' -f1 && echo 'GOOGLE_CLIENT_SECRET:' && grep GOOGLE_CLIENT_SECRET .env | cut -d'=' -f1 && echo 'NEXTAUTH_URL:' && grep NEXTAUTH_URL .env && echo 'NEXTAUTH_SECRET:' && grep NEXTAUTH_SECRET .env | cut -d'=' -f1"

Write-Host "`n2. PM2 log'larinda Google OAuth hatalari kontrol ediliyor..." -ForegroundColor Yellow
ssh root@alo17.tr "cd /var/www/alo17 && pm2 logs alo17 --lines 50 --nostream | grep -i 'google\|oauth\|auth' | tail -20"

Write-Host "`n=== Kontrol Tamamlandi ===" -ForegroundColor Green
Write-Host "`nEger environment variable'lar eksikse:" -ForegroundColor Yellow
Write-Host "  ssh root@alo17.tr" -ForegroundColor White
Write-Host "  cd /var/www/alo17" -ForegroundColor White
Write-Host "  nano .env" -ForegroundColor White
Write-Host "  # GOOGLE_CLIENT_ID ve GOOGLE_CLIENT_SECRET ekleyin" -ForegroundColor White
Write-Host "  pm2 restart all" -ForegroundColor White

