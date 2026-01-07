# Günlük Kontrol Script'i
# PM2 durumu, loglar, sistem kaynakları kontrol eder

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Günlük Sistem Kontrolü" -ForegroundColor Yellow
Write-Host "Tarih: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. PM2 Status
Write-Host "1. PM2 Status..." -ForegroundColor Yellow
ssh $SERVER "pm2 status" 2>&1

# 2. Son Hatalar
Write-Host "`n2. Son Hatalar (son 10 satır)..." -ForegroundColor Yellow
ssh $SERVER "pm2 logs alo17 --err --lines 10 --nostream" 2>&1

# 3. Bellek Kullanımı
Write-Host "`n3. Bellek Kullanımı..." -ForegroundColor Yellow
ssh $SERVER "pm2 describe alo17 | grep -E 'memory|restart|uptime'" 2>&1

# 4. Sistem Kaynakları
Write-Host "`n4. Sistem Kaynakları..." -ForegroundColor Yellow
ssh $SERVER "free -h && echo '---' && df -h / | tail -1" 2>&1

# 5. Port Kontrolü
Write-Host "`n5. Port 3000 Kontrolü..." -ForegroundColor Yellow
ssh $SERVER "netstat -tlnp | grep :3000 || echo '⚠️ Port 3000 dinlenmiyor!'" 2>&1

# 6. Health Check
Write-Host "`n6. Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://alo17.tr/api/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Site erişilebilir" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Site yanıt veriyor ama HTTP $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Site erişilemiyor: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "Kontrol Tamamlandı" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

