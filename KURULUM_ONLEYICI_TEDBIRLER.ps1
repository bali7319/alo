# Önleyici Tedbirler Kurulum Script'i

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ONLEYICI TEDBIRLER KURULUMU" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. PM2 Log Rotation Kurulumu
Write-Host "1. PM2 Log Rotation kuruluyor..." -ForegroundColor Yellow
ssh $SERVER "pm2 install pm2-logrotate" 2>&1
ssh $SERVER "pm2 set pm2-logrotate:max_size 10M" 2>&1
ssh $SERVER "pm2 set pm2-logrotate:retain 7" 2>&1
ssh $SERVER "pm2 set pm2-logrotate:compress true" 2>&1
ssh $SERVER "pm2 set pm2-logrotate:rotateInterval '0 0 * * *'" 2>&1
ssh $SERVER "pm2 save" 2>&1
Write-Host "✅ PM2 Log Rotation kuruldu" -ForegroundColor Green
Write-Host ""

# 2. PM2 Monitoring (Opsiyonel - Ücretli)
Write-Host "2. PM2 Monitoring kontrol ediliyor..." -ForegroundColor Yellow
$monitoringStatus = ssh $SERVER "pm2 link" 2>&1
if ($monitoringStatus -match "already|connected") {
    Write-Host "✅ PM2 Monitoring zaten aktif" -ForegroundColor Green
} else {
    Write-Host "ℹ️  PM2 Monitoring kurulu degil (opsiyonel, ucretli)" -ForegroundColor Gray
}
Write-Host ""

# 3. Health Check Endpoint Test
Write-Host "3. Health Check endpoint test ediliyor..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://alo17.tr/api/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health Check endpoint calisiyor" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Health Check endpoint yanit veriyor ama HTTP $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Health Check endpoint erisilebilir degil" -ForegroundColor Red
}
Write-Host ""

# 4. Disk Kullanımı Kontrolü
Write-Host "4. Disk kullanimi kontrol ediliyor..." -ForegroundColor Yellow
$diskUsage = ssh $SERVER "df -h / | tail -1" 2>&1
Write-Host $diskUsage
$usagePercent = ($diskUsage -split '\s+')[4] -replace '%', ''
if ([int]$usagePercent -gt 80) {
    Write-Host "⚠️  Disk kullanimi %80'i asti! Temizlik yapilmali" -ForegroundColor Red
} else {
    Write-Host "✅ Disk kullanimi normal" -ForegroundColor Green
}
Write-Host ""

# 5. PM2 Durumu
Write-Host "5. PM2 durumu kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER "pm2 status" 2>&1
Write-Host ""

# 6. Nginx Durumu
Write-Host "6. Nginx durumu kontrol ediliyor..." -ForegroundColor Yellow
$nginxStatus = ssh $SERVER "systemctl status nginx --no-pager | head -5" 2>&1
Write-Host $nginxStatus
if ($nginxStatus -match "active.*running") {
    Write-Host "✅ Nginx calisiyor" -ForegroundColor Green
} else {
    Write-Host "❌ Nginx sorunu var!" -ForegroundColor Red
}
Write-Host ""

# 7. Cron Job Önerisi
Write-Host "7. Cron Job onerisi:" -ForegroundColor Yellow
Write-Host "   Her 5 dakikada bir health check yapmak icin:" -ForegroundColor White
Write-Host "   */5 * * * * curl -f http://localhost:3000/api/health || pm2 restart alo17" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Günlük kontrol script'i calistirmak icin:" -ForegroundColor White
Write-Host "   0 9 * * * cd /var/www/alo17 && ./scripts/daily-check.sh" -ForegroundColor Cyan
Write-Host ""

# 8. Özet
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "KURULUM TAMAMLANDI" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Yapilan islemler:" -ForegroundColor Yellow
Write-Host "✅ PM2 Log Rotation kuruldu" -ForegroundColor Green
Write-Host "✅ Health Check endpoint test edildi" -ForegroundColor Green
Write-Host "✅ Disk kullanimi kontrol edildi" -ForegroundColor Green
Write-Host "✅ PM2 ve Nginx durumu kontrol edildi" -ForegroundColor Green
Write-Host ""
Write-Host "Sonraki adimlar:" -ForegroundColor Yellow
Write-Host "1. Otomatik health check script'i düzenli calistirin" -ForegroundColor White
Write-Host "2. Günlük kontrol script'i düzenli calistirin" -ForegroundColor White
Write-Host "3. Cron job kurulumu yapin (opsiyonel)" -ForegroundColor White
Write-Host "4. Uptime monitoring servisi kullanin (opsiyonel)" -ForegroundColor White
Write-Host ""

