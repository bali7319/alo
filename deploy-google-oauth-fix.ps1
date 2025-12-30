# Google OAuth Hata Yonetimi Fix Deploy
Write-Host "Google OAuth hata yonetimi duzeltmeleri yukleniyor..." -ForegroundColor Yellow

Write-Host "1. Auth dosyasi yukleniyor..." -ForegroundColor Cyan
scp src/lib/auth.ts root@alo17.tr:/var/www/alo17/src/lib/auth.ts

Write-Host "2. Giris sayfasi yukleniyor..." -ForegroundColor Cyan
scp src/app/giris/page.tsx root@alo17.tr:/var/www/alo17/src/app/giris/page.tsx

Write-Host "3. Build dosyalari yukleniyor..." -ForegroundColor Cyan
scp -r .next root@alo17.tr:/var/www/alo17/

Write-Host "4. PM2 restart ediliyor..." -ForegroundColor Cyan
ssh root@alo17.tr "cd /var/www/alo17 && pm2 restart all && echo 'Deploy tamamlandi!'"

Write-Host "`nFix tamamlandi! ✅" -ForegroundColor Green
Write-Host "Yapilan duzeltmeler:" -ForegroundColor Cyan
Write-Host "  - Google OAuth callback'inde detayli log'lama eklendi" -ForegroundColor White
Write-Host "  - Email kontrolu eklendi" -ForegroundColor White
Write-Host "  - Giris sayfasinda hata mesajlari gosteriliyor" -ForegroundColor White
Write-Host "  - NextAuth error kodlari kullanici dostu mesajlara cevrildi" -ForegroundColor White
Write-Host "`nTest icin:" -ForegroundColor Yellow
Write-Host "  1. https://alo17.tr/giris sayfasina gidin" -ForegroundColor White
Write-Host "  2. Google ile giris yap butonuna tiklayin" -ForegroundColor White
Write-Host "  3. Hesap secin" -ForegroundColor White
Write-Host "  4. Eger hata varsa, giris sayfasinda hata mesaji gorunecek" -ForegroundColor White
Write-Host "  5. Sunucu log'larini kontrol edin: ssh root@alo17.tr 'pm2 logs alo17 --lines 50'" -ForegroundColor White

