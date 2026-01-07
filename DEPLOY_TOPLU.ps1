# Toplu Deploy - Admin İlanlar + Bildirim Sistemi
# Süre uzatma, premium seçenekleri ve admin bildirimleri + Sesli Uyarı

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "TOPLU DEPLOY - ADMIN OZELLIKLERI" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

Write-Host "1. Dosyalar sunucuya kopyalaniyor..." -ForegroundColor Yellow

# Admin İlanlar dosyaları
Write-Host "   - Admin ilanlar sayfasi..." -ForegroundColor Gray
scp src/app/admin/ilanlar/page.tsx $SERVER`:$REMOTE_PATH/src/app/admin/ilanlar/page.tsx 2>&1 | Out-Null

Write-Host "   - Admin listings API..." -ForegroundColor Gray
scp 'src/app/api/admin/listings/[id]/route.ts' $SERVER`:$REMOTE_PATH/src/app/api/admin/listings/[id]/route.ts 2>&1 | Out-Null

# Bildirim sistemi dosyaları
Write-Host "   - Email servisi..." -ForegroundColor Gray
scp src/lib/email.ts $SERVER`:$REMOTE_PATH/src/lib/email.ts 2>&1 | Out-Null

Write-Host "   - Notification servisi..." -ForegroundColor Gray
scp src/lib/notifications.ts $SERVER`:$REMOTE_PATH/src/lib/notifications.ts 2>&1 | Out-Null

Write-Host "   - Notification API..." -ForegroundColor Gray
scp src/app/api/notifications/route.ts $SERVER`:$REMOTE_PATH/src/app/api/notifications/route.ts 2>&1 | Out-Null

Write-Host "   - Header (sesli uyari ile)..." -ForegroundColor Gray
scp src/components/Header.tsx $SERVER`:$REMOTE_PATH/src/components/Header.tsx 2>&1 | Out-Null

Write-Host "   - Listings API (bildirim entegrasyonu)..." -ForegroundColor Gray
scp src/app/api/listings/route.ts $SERVER`:$REMOTE_PATH/src/app/api/listings/route.ts 2>&1 | Out-Null

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
Write-Host "- Sure uzatma butonu (sure dolmus ilanlar icin)" -ForegroundColor White
Write-Host "- Premium 3 aylik secenegi (90 gun)" -ForegroundColor White
Write-Host "- Premium yillik secenegi (365 gun)" -ForegroundColor White
Write-Host "- Email bildirimi (simule ediliyor)" -ForegroundColor White
Write-Host "- Database notification (aktif)" -ForegroundColor White
Write-Host "- Header notification dropdown (aktif)" -ForegroundColor White
Write-Host "- Sesli uyari (yeni bildirim geldiginde)" -ForegroundColor Cyan
Write-Host "`nTest:" -ForegroundColor Yellow
Write-Host "https://alo17.tr/admin/ilanlar" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

