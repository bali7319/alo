# ID undefined Fix Deploy
Write-Host "Ilan ver sayfasi ID fix yukleniyor..." -ForegroundColor Yellow
scp src/app/ilan-ver/page.tsx root@alo17.tr:/var/www/alo17/src/app/ilan-ver/page.tsx

Write-Host "Build dosyalari yukleniyor..." -ForegroundColor Yellow
scp -r .next root@alo17.tr:/var/www/alo17/

Write-Host "PM2 restart ediliyor..." -ForegroundColor Yellow
ssh root@alo17.tr "cd /var/www/alo17 && pm2 restart all && echo 'Deploy tamamlandi!'"

Write-Host "`nFix tamamlandi! ✅" -ForegroundColor Green
Write-Host "Yapilan duzeltmeler:" -ForegroundColor Cyan
Write-Host "  - API response'unda data.listing.id veya data.id kontrolu eklendi" -ForegroundColor White
Write-Host "  - ID yoksa hata mesaji ve yonlendirme eklendi" -ForegroundColor White
Write-Host "  - Console log'lar eklendi (debug icin)" -ForegroundColor White

