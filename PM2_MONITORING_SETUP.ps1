# PM2 Monitoring ve Önleyici Ayarlar
# Bu script PM2 process'inin durmasını önlemek için gerekli ayarları yapar

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "PM2 Monitoring ve Önleyici Ayarlar" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. PM2 log rotation kurulumu..." -ForegroundColor Yellow
ssh $SERVER "pm2 install pm2-logrotate" 2>&1

Write-Host "`n2. Log rotation ayarları..." -ForegroundColor Yellow
ssh $SERVER "pm2 set pm2-logrotate:max_size 10M && pm2 set pm2-logrotate:retain 7 && pm2 set pm2-logrotate:compress true && pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss" 2>&1

Write-Host "`n3. PM2 startup script kontrolü..." -ForegroundColor Yellow
ssh $SERVER "pm2 startup" 2>&1

Write-Host "`n4. Mevcut process'leri kaydetme..." -ForegroundColor Yellow
ssh $SERVER "pm2 save" 2>&1

Write-Host "`n5. Ecosystem config güncelleme..." -ForegroundColor Yellow
Write-Host "   (ecosystem.config.js dosyası güncellenmeli)" -ForegroundColor Cyan

Write-Host "`n6. PM2 durumu..." -ForegroundColor Yellow
ssh $SERVER "pm2 status" 2>&1

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "✅ Ayarlar tamamlandı!" -ForegroundColor Green
Write-Host "`nÖneriler:" -ForegroundColor Yellow
Write-Host "- ecosystem.config.js'de max_memory_restart: '2G' olmalı" -ForegroundColor Cyan
Write-Host "- min_uptime, max_restarts, restart_delay eklenmeli" -ForegroundColor Cyan
Write-Host "- Düzenli olarak 'pm2 logs alo17 --err' kontrol edin" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

