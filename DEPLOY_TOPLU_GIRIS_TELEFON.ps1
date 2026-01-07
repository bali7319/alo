# Toplu Deploy - Giriş Yönlendirme + Telefon Numaraları
# Giriş yönlendirmesi ve admin üyeler sayfasında telefon numaraları görünürlüğü

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "TOPLU DEPLOY - GIRIS + TELEFON" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

Write-Host "1. Dosyalar sunucuya kopyalaniyor..." -ForegroundColor Yellow

# Giriş yönlendirme dosyaları
Write-Host "   - Giriş sayfasi..." -ForegroundColor Gray
scp src/app/giris/page.tsx $SERVER`:$REMOTE_PATH/src/app/giris/page.tsx 2>&1 | Out-Null

Write-Host "   - Auth config..." -ForegroundColor Gray
scp src/lib/auth.ts $SERVER`:$REMOTE_PATH/src/lib/auth.ts 2>&1 | Out-Null

# Admin üyeler sayfası ve API
Write-Host "   - Admin üyeler API (telefon çözme iyileştirildi)..." -ForegroundColor Gray
scp src/app/api/admin/users/route.ts $SERVER`:$REMOTE_PATH/src/app/api/admin/users/route.ts 2>&1 | Out-Null

Write-Host "   Dosyalar kopyalandi!" -ForegroundColor Green

Write-Host "`n2. Build yapiliyor (bu biraz zaman alabilir)..." -ForegroundColor Yellow
$buildOutput = ssh $SERVER "cd $REMOTE_PATH && npm run build" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Build basarili!" -ForegroundColor Green
} else {
    Write-Host "   Build hatasi olabilir, kontrol edin!" -ForegroundColor Red
    Write-Host $buildOutput -ForegroundColor Red
}

Write-Host "`n3. PM2 yeniden baslatiliyor..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && pm2 restart alo17 && pm2 save" 2>&1 | Out-Null
Write-Host "   PM2 yeniden baslatildi!" -ForegroundColor Green

Write-Host "`n4. PM2 durumu kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER "pm2 status" 2>&1

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "DEPLOY TAMAMLANDI!" -ForegroundColor Green
Write-Host "Sure: $([math]::Round($duration, 2)) saniye" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "`nYeni ozellikler:" -ForegroundColor Yellow
Write-Host "- Giriş yönlendirmesi: Korunan sayfadan gelindiyse oraya, yoksa ana sayfaya" -ForegroundColor White
Write-Host "- Admin üyeler sayfasında telefon numaraları görünür (şifre çözülmüş)" -ForegroundColor White
Write-Host "- Kayıt sırasında alınan telefon numaraları artık görünecek" -ForegroundColor White
Write-Host "- Şifre çözme mantığı iyileştirildi (daha esnek format kontrolü)" -ForegroundColor White
Write-Host "`nTest:" -ForegroundColor Yellow
Write-Host "1. Giriş yapın ve yönlendirmeyi kontrol edin" -ForegroundColor White
Write-Host "2. https://alo17.tr/admin/uyeler sayfasında telefon numaralarını kontrol edin" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan

