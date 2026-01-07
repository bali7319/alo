# Otomatik Health Check ve Restart Script'i
# Bu script site erişilemezse otomatik restart yapar

$SERVER = "root@alo17.tr"
$HEALTH_URL = "https://alo17.tr/api/health"
$MAX_RETRIES = 3
$RETRY_DELAY = 10 # saniye

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "OTOMATIK HEALTH CHECK VE RESTART" -ForegroundColor Yellow
Write-Host "Tarih: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$retryCount = 0
$isHealthy = $false

# Health check
while ($retryCount -lt $MAX_RETRIES -and -not $isHealthy) {
    $retryCount++
    Write-Host "Health check denemesi $retryCount/$MAX_RETRIES..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $HEALTH_URL -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Site saglikli (HTTP $($response.StatusCode))" -ForegroundColor Green
            $isHealthy = $true
        } else {
            Write-Host "⚠️  Site yanit veriyor ama HTTP $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Health check basarisiz: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($retryCount -lt $MAX_RETRIES) {
            Write-Host "   $RETRY_DELAY saniye bekleniyor..." -ForegroundColor Gray
            Start-Sleep -Seconds $RETRY_DELAY
        }
    }
}

# Eğer site sağlıklı değilse restart yap
if (-not $isHealthy) {
    Write-Host ""
    Write-Host "⚠️  Site saglikli degil, restart yapiliyor..." -ForegroundColor Red
    Write-Host ""
    
    # PM2 restart
    Write-Host "1. PM2 restart yapiliyor..." -ForegroundColor Yellow
    ssh $SERVER "cd /var/www/alo17 && pm2 restart alo17 && pm2 save" 2>&1
    Write-Host ""
    
    # Nginx reload
    Write-Host "2. Nginx reload yapiliyor..." -ForegroundColor Yellow
    ssh $SERVER "systemctl reload nginx" 2>&1
    Write-Host ""
    
    # 10 saniye bekle
    Write-Host "3. 10 saniye bekleniyor..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    Write-Host ""
    
    # Tekrar health check
    Write-Host "4. Tekrar health check yapiliyor..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri $HEALTH_URL -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Site restart sonrasi saglikli (HTTP $($response.StatusCode))" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Site yanit veriyor ama HTTP $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Site hala erisilebilir degil: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Manuel kontrol gerekli!" -ForegroundColor Red
        Write-Host "Komut: ssh $SERVER 'pm2 logs alo17 --lines 50 --nostream'" -ForegroundColor Cyan
    }
} else {
    Write-Host ""
    Write-Host "✅ Site saglikli, herhangi bir islem yapilmadi" -ForegroundColor Green
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ISLEM TAMAMLANDI" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

