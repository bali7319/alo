# 502 Bad Gateway Hatası - Hızlı Çözüm Scripti

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "502 BAD GATEWAY - HIZLI COZUM" -ForegroundColor Red
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. PM2 durumu kontrol ediliyor..." -ForegroundColor Yellow
ssh -p 2222 root@alo17.tr "pm2 status"
Write-Host ""

Write-Host "2. PM2 yeniden baslatiliyor..." -ForegroundColor Yellow
ssh -p 2222 root@alo17.tr "cd /var/www/alo17 && pm2 restart alo17 && pm2 save"
Write-Host ""

Write-Host "3. Nginx yeniden yukleniyor..." -ForegroundColor Yellow
ssh -p 2222 root@alo17.tr "systemctl reload nginx"
Write-Host ""

Write-Host "4. Port 3000 kontrol ediliyor..." -ForegroundColor Yellow
ssh -p 2222 root@alo17.tr "netstat -tlnp | grep 3000"
Write-Host ""

Write-Host "5. PM2 loglari kontrol ediliyor (son 20 satir)..." -ForegroundColor Yellow
ssh -p 2222 root@alo17.tr "pm2 logs alo17 --lines 20 --nostream"
Write-Host ""

Write-Host "6. Site durumu kontrol ediliyor..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://alo17.tr" -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Site calisiyor! (Status: $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Site yanit veriyor ama status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Site hala erisilebilir degil: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manuel kontrol gerekli:" -ForegroundColor Yellow
    Write-Host "1. Sunucuya SSH ile baglan" -ForegroundColor White
    Write-Host "2. pm2 logs alo17 --lines 100 kontrol et" -ForegroundColor White
    Write-Host "3. systemctl status nginx kontrol et" -ForegroundColor White
    Write-Host "4. free -h ve df -h ile kaynak kullanimini kontrol et" -ForegroundColor White
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "TAMAMLANDI" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

