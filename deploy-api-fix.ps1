# API Route ve Önizleme Sayfası Fix Deploy
Write-Host "API route fix yukleniyor..." -ForegroundColor Yellow
scp src/app/api/listings/[id]/route.ts root@alo17.tr:/var/www/alo17/src/app/api/listings/[id]/route.ts

Write-Host "Onizleme sayfasi fix yukleniyor..." -ForegroundColor Yellow
scp src/app/ilan-ver/onizle/[id]/page.tsx root@alo17.tr:/var/www/alo17/src/app/ilan-ver/onizle/[id]/page.tsx

Write-Host "Build dosyalari yukleniyor..." -ForegroundColor Yellow
scp -r .next root@alo17.tr:/var/www/alo17/

Write-Host "PM2 restart ediliyor..." -ForegroundColor Yellow
ssh root@alo17.tr "cd /var/www/alo17 && pm2 restart all"

Write-Host "`nFix tamamlandi! ✅" -ForegroundColor Green
Write-Host "Yapilan duzeltmeler:" -ForegroundColor Cyan
Write-Host "  - API route pending ilanlari sahibine gosteriyor" -ForegroundColor White
Write-Host "  - Detayli hata mesajlari eklendi" -ForegroundColor White
Write-Host "  - Console log'lar eklendi (debug icin)" -ForegroundColor White

