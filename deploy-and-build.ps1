# Google OAuth Fix - Sunucuda Build
Write-Host "=== Google OAuth Fix - Sunucuda Build ===" -ForegroundColor Cyan

Write-Host "`n1. Guncellenen dosyalar yukleniyor..." -ForegroundColor Yellow
scp src/lib/auth.ts root@alo17.tr:/var/www/alo17/src/lib/auth.ts
scp src/app/giris/page.tsx root@alo17.tr:/var/www/alo17/src/app/giris/page.tsx

Write-Host "`n2. Sunucuda build yapiliyor..." -ForegroundColor Yellow
ssh root@alo17.tr "cd /var/www/alo17 && npm run build"

Write-Host "`n3. PM2 restart ediliyor..." -ForegroundColor Yellow
ssh root@alo17.tr "cd /var/www/alo17 && pm2 restart all"

Write-Host "`n=== Deploy Tamamlandi! ===" -ForegroundColor Green
Write-Host "Yapilan duzeltmeler:" -ForegroundColor Cyan
Write-Host "  - Google OAuth callback'inde detayli log'lama" -ForegroundColor White
Write-Host "  - Email kontrolu ve hata yonetimi" -ForegroundColor White
Write-Host "  - Giris sayfasinda hata mesajlari gosterimi" -ForegroundColor White

