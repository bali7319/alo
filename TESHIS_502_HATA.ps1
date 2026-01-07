# 502 Bad Gateway Hatası - Otomatik Teşhis Scripti

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "502 BAD GATEWAY - OTOMATIK TESHIS" -ForegroundColor Red
Write-Host "Tarih: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. PM2 Status
Write-Host "1. PM2 Durumu..." -ForegroundColor Yellow
ssh $SERVER "pm2 status" 2>&1
Write-Host ""

# 2. Port 3000 Kontrolü
Write-Host "2. Port 3000 Kontrolü..." -ForegroundColor Yellow
$portCheck = ssh $SERVER "netstat -tlnp | grep :3000" 2>&1
if ($portCheck -match "3000") {
    Write-Host "✅ Port 3000 dinleniyor" -ForegroundColor Green
    Write-Host $portCheck
} else {
    Write-Host "❌ Port 3000 dinlenmiyor!" -ForegroundColor Red
    Write-Host $portCheck
}
Write-Host ""

# 3. PM2 Logları (Son 30 satır - Hata ve Çıktı)
Write-Host "3. PM2 Logları (Son 30 satır)..." -ForegroundColor Yellow
Write-Host "--- HATA LOGLARI ---" -ForegroundColor Red
ssh $SERVER "pm2 logs alo17 --err --lines 30 --nostream" 2>&1
Write-Host ""
Write-Host "--- CIKTI LOGLARI ---" -ForegroundColor Green
ssh $SERVER "pm2 logs alo17 --out --lines 30 --nostream" 2>&1
Write-Host ""

# 4. Memory ve CPU Kullanımı
Write-Host "4. Sistem Kaynakları..." -ForegroundColor Yellow
ssh $SERVER "free -h" 2>&1
Write-Host ""
ssh $SERVER "df -h / | tail -1" 2>&1
Write-Host ""

# 5. PM2 Process Detayları
Write-Host "5. PM2 Process Detayları..." -ForegroundColor Yellow
ssh $SERVER "pm2 describe alo17 | grep -E 'status|memory|restart|uptime|error'" 2>&1
Write-Host ""

# 6. Nginx Durumu
Write-Host "6. Nginx Durumu..." -ForegroundColor Yellow
ssh $SERVER "systemctl status nginx --no-pager | head -10" 2>&1
Write-Host ""

# 7. Nginx Error Logları (Son 20 satır)
Write-Host "7. Nginx Error Logları (Son 20 satır)..." -ForegroundColor Yellow
ssh $SERVER "tail -20 /var/log/nginx/alo17-error.log 2>/dev/null || echo 'Log dosyasi bulunamadi'" 2>&1
Write-Host ""

# 8. Process Kontrolü
Write-Host "8. Node Process Kontrolü..." -ForegroundColor Yellow
ssh $SERVER "ps aux | grep -E 'node|next' | grep -v grep" 2>&1
Write-Host ""

# 9. Health Check
Write-Host "9. Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://alo17.tr/api/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check basarili (Status: $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Health check yanit veriyor ama status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Health check erisilebilir degil: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 10. Localhost Test
Write-Host "10. Localhost:3000 Test..." -ForegroundColor Yellow
$localhostTest = ssh $SERVER "curl -I http://localhost:3000 2>&1 | head -5" 2>&1
if ($localhostTest -match "200") {
    Write-Host "✅ Localhost:3000 erisilebilir" -ForegroundColor Green
} else {
    Write-Host "❌ Localhost:3000 erisilebilir degil" -ForegroundColor Red
}
Write-Host $localhostTest
Write-Host ""

# Özet ve Öneriler
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "TESHis TAMAMLANDI" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Onerilen cozum adimlari:" -ForegroundColor Yellow
Write-Host "1. Eger PM2 process durmuşsa:" -ForegroundColor White
Write-Host "   ssh $SERVER 'cd $REMOTE_PATH && pm2 restart alo17 && pm2 save'" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Eger Nginx sorunu varsa:" -ForegroundColor White
Write-Host "   ssh $SERVER 'systemctl reload nginx'" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Hizli cozum (her ikisi):" -ForegroundColor White
Write-Host "   ssh $SERVER 'cd $REMOTE_PATH && pm2 restart alo17 && pm2 save && systemctl reload nginx'" -ForegroundColor Cyan
Write-Host ""

