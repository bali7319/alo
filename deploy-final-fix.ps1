# Final Fix - ID prop direkt kullaniliyor
Write-Host "Onizleme sayfasi final fix yukleniyor..." -ForegroundColor Yellow
scp src/app/ilan-ver/onizle/[id]/page.tsx root@alo17.tr:/var/www/alo17/src/app/ilan-ver/onizle/[id]/page.tsx

Write-Host "Build dosyalari yukleniyor..." -ForegroundColor Yellow
scp -r .next root@alo17.tr:/var/www/alo17/

Write-Host "PM2 restart ediliyor..." -ForegroundColor Yellow
ssh root@alo17.tr "cd /var/www/alo17 && pm2 restart all && echo 'Deploy tamamlandi!'"

Write-Host "`nFix tamamlandi! ✅" -ForegroundColor Green
Write-Host "Yapilan duzeltmeler:" -ForegroundColor Cyan
Write-Host "  - listingId state kaldirildi, id prop direkt kullaniliyor" -ForegroundColor White
Write-Host "  - useEffect'ler id prop'una gore calisiyor" -ForegroundColor White
Write-Host "  - Daha basit ve guvenilir kod" -ForegroundColor White

