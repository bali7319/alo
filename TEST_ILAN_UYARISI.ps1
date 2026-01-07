# Yeni İlan Uyarısı Test Scripti
# Bu script test ilanı oluşturur ve bildirim sistemini test eder

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"
$SITE_URL = "https://alo17.tr"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "YENI ILAN UYARISI TESTI" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Bu test scripti:" -ForegroundColor Yellow
Write-Host "1. PM2 loglarini kontrol eder" -ForegroundColor White
Write-Host "2. Notification API'yi test eder" -ForegroundColor White
Write-Host "3. Database'deki son bildirimleri gosterir" -ForegroundColor White
Write-Host ""

Write-Host "1. PM2 durumu kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER "pm2 status" 2>&1

Write-Host "`n2. Son PM2 loglari (bildirim ile ilgili)..." -ForegroundColor Yellow
ssh $SERVER "pm2 logs alo17 --lines 30 --nostream | grep -i 'notification\|bildirim\|email'" 2>&1

Write-Host "`n3. Notification API test ediliyor..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$SITE_URL/api/notifications" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "   API yanit verdi: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Okunmamis bildirim sayisi: $($data.unreadCount)" -ForegroundColor Cyan
    Write-Host "   Toplam bildirim sayisi: $($data.notifications.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "   API hatasi: $_" -ForegroundColor Red
}

Write-Host "`n4. Database'deki son bildirimler..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && npx prisma db execute --stdin" <<< "SELECT id, title, message, type, isRead, createdAt FROM Notification ORDER BY createdAt DESC LIMIT 5;" 2>&1

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "TEST TAMAMLANDI!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "`nManuel test icin:" -ForegroundColor Yellow
Write-Host "1. Admin olarak giris yapin: $SITE_URL" -ForegroundColor White
Write-Host "2. Header'daki bildirim ikonunu kontrol edin" -ForegroundColor White
Write-Host "3. Yeni bir test ilani olusturun" -ForegroundColor White
Write-Host "4. Bildirim ve sesli uyariyi kontrol edin" -ForegroundColor White
Write-Host "`nDetayli rehber: TEST_YENI_ILAN_UYARISI.md" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan

