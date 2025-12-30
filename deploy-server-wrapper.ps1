# Server Component Wrapper Fix Deploy
Write-Host "Onizleme sayfasi server wrapper fix yukleniyor..." -ForegroundColor Yellow
scp src/app/ilan-ver/onizle/[id]/page.tsx root@alo17.tr:/var/www/alo17/src/app/ilan-ver/onizle/[id]/page.tsx

Write-Host "Build dosyalari yukleniyor..." -ForegroundColor Yellow
scp -r .next root@alo17.tr:/var/www/alo17/

Write-Host "PM2 restart ediliyor..." -ForegroundColor Yellow
ssh root@alo17.tr "cd /var/www/alo17 && pm2 restart all"

Write-Host "`nFix tamamlandi! ✅" -ForegroundColor Green
Write-Host "Yapilan duzeltmeler:" -ForegroundColor Cyan
Write-Host "  - Server component wrapper eklendi" -ForegroundColor White
Write-Host "  - ID artik server component'ten prop olarak geciyor" -ForegroundColor White
Write-Host "  - Next.js 15'te daha guvenilir yontem" -ForegroundColor White

