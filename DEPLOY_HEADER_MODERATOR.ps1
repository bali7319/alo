# Deploy - Header Moderator Linki
# Header'a moderator paneli linki eklendi

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "DEPLOY - HEADER MODERATOR LINKI" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

Write-Host "1. Dosya sunucuya kopyalaniyor..." -ForegroundColor Yellow

Write-Host "   - Header component (moderator linki)..." -ForegroundColor Gray
scp src/components/Header.tsx $SERVER`:$REMOTE_PATH/src/components/Header.tsx 2>&1 | Out-Null

Write-Host "   Dosya kopyalandi!" -ForegroundColor Green

Write-Host "`n2. Build yapiliyor (bu biraz zaman alabilir)..." -ForegroundColor Yellow
$buildOutput = ssh $SERVER "cd $REMOTE_PATH; npm run build" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Build basarili!" -ForegroundColor Green
} else {
    Write-Host "   Build hatasi olabilir, kontrol edin!" -ForegroundColor Red
    Write-Host $buildOutput -ForegroundColor Red
}

Write-Host "`n3. PM2 yeniden baslatiliyor..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH; pm2 restart alo17; pm2 save" 2>&1 | Out-Null
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
Write-Host "- Header dropdown menüye 'Moderatör Paneli' linki eklendi" -ForegroundColor White
Write-Host "- Mobil menüye 'Moderatör Paneli' linki eklendi" -ForegroundColor White
Write-Host "- Sadece moderator rolündeki kullanıcılar görecek" -ForegroundColor White
Write-Host "`nTest:" -ForegroundColor Yellow
Write-Host "https://alo17.tr - Kullanıcı dropdown menüsünü kontrol edin" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

