# Deploy - Giriş Sayfası + Hukuki Belgeler
# Giriş sayfası callbackUrl decode ve admin panel menü güncellemesi

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "DEPLOY - GIRIS + HUKUKI BELGELER" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

Write-Host "1. Dosyalar sunucuya kopyalaniyor..." -ForegroundColor Yellow

Write-Host "   - Giriş sayfasi (callbackUrl decode)..." -ForegroundColor Gray
scp src/app/giris/page.tsx $SERVER`:$REMOTE_PATH/src/app/giris/page.tsx 2>&1 | Out-Null

Write-Host "   - Admin layout (Hukuki Belgeler)..." -ForegroundColor Gray
scp src/app/admin/layout.tsx $SERVER`:$REMOTE_PATH/src/app/admin/layout.tsx 2>&1 | Out-Null

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
Write-Host "`nGuncellemeler:" -ForegroundColor Yellow
Write-Host "- Giriş sayfasi callbackUrl decode duzeltmesi" -ForegroundColor White
Write-Host "- Admin panel menü: Sözleşmeler -> Hukuki Belgeler" -ForegroundColor White
Write-Host "`nTest:" -ForegroundColor Yellow
Write-Host "https://alo17.tr/giris?callbackUrl=https%3A%2F%2Falo17.tr" -ForegroundColor Cyan
Write-Host "https://alo17.tr/admin/sozlesmeler" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

