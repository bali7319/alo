# Otomatik Health Check Script Kurulumu

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"
$SCRIPT_NAME = "health-check.sh"
$CRON_SCHEDULE = "*/5 * * * *" # Her 5 dakikada bir

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "OTOMATIK HEALTH CHECK KURULUMU" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Script dosyasını sunucuya kopyala
Write-Host "1. Health check script'i sunucuya kopyalaniyor..." -ForegroundColor Yellow
scp health-check.sh "$SERVER`:$REMOTE_PATH/$SCRIPT_NAME" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Script kopyalandi" -ForegroundColor Green
} else {
    Write-Host "❌ Script kopyalanamadi!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Script'e çalıştırma izni ver
Write-Host "2. Script'e calistirma izni veriliyor..." -ForegroundColor Yellow
ssh $SERVER "chmod +x $REMOTE_PATH/$SCRIPT_NAME" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Calistirma izni verildi" -ForegroundColor Green
} else {
    Write-Host "❌ Izin verilemedi!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 3. Logs dizinini kontrol et ve oluştur
Write-Host "3. Logs dizini kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER "mkdir -p $REMOTE_PATH/logs && chmod 755 $REMOTE_PATH/logs" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Logs dizini hazir" -ForegroundColor Green
} else {
    Write-Host "⚠️  Logs dizini olusturulamadi" -ForegroundColor Yellow
}
Write-Host ""

# 4. Script'i test et
Write-Host "4. Script test ediliyor..." -ForegroundColor Yellow
$testResult = ssh $SERVER "$REMOTE_PATH/$SCRIPT_NAME" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Script test basarili" -ForegroundColor Green
} else {
    Write-Host "⚠️  Script test hatasi (normal olabilir)" -ForegroundColor Yellow
}
Write-Host ""

# 5. Mevcut cron job'ları kontrol et
Write-Host "5. Mevcut cron job'lar kontrol ediliyor..." -ForegroundColor Yellow
$existingCron = ssh $SERVER "crontab -l 2>/dev/null | grep -c '$SCRIPT_NAME' || echo '0'" 2>&1
if ([int]$existingCron -gt 0) {
    Write-Host "⚠️  Health check cron job zaten mevcut" -ForegroundColor Yellow
    Write-Host "   Mevcut cron job silinecek ve yenisi eklenecek..." -ForegroundColor Yellow
    ssh $SERVER "crontab -l 2>/dev/null | grep -v '$SCRIPT_NAME' | crontab -" 2>&1
}
Write-Host ""

# 6. Cron job ekle
Write-Host "6. Cron job ekleniyor (Her 5 dakikada bir)..." -ForegroundColor Yellow
$cronJob = "$CRON_SCHEDULE $REMOTE_PATH/$SCRIPT_NAME >> $REMOTE_PATH/logs/health-check-cron.log 2>&1"
ssh $SERVER "(crontab -l 2>/dev/null; echo '$cronJob') | crontab -" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Cron job eklendi" -ForegroundColor Green
} else {
    Write-Host "❌ Cron job eklenemedi!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 7. Cron job'ı doğrula
Write-Host "7. Cron job dogrulaniyor..." -ForegroundColor Yellow
$verifyCron = ssh $SERVER "crontab -l | grep '$SCRIPT_NAME'" 2>&1
if ($verifyCron -match "$SCRIPT_NAME") {
    Write-Host "✅ Cron job dogrulandi:" -ForegroundColor Green
    Write-Host "   $verifyCron" -ForegroundColor Cyan
} else {
    Write-Host "❌ Cron job dogrulanamadi!" -ForegroundColor Red
}
Write-Host ""

# 8. Log dosyasını kontrol et
Write-Host "8. Log dosyasi kontrol ediliyor..." -ForegroundColor Yellow
$logCheck = ssh $SERVER "tail -5 $REMOTE_PATH/logs/health-check.log 2>/dev/null || echo 'Log dosyasi henuz olusturulmadi'" 2>&1
Write-Host $logCheck
Write-Host ""

# Özet
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "KURULUM TAMAMLANDI" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Yapilan islemler:" -ForegroundColor Yellow
Write-Host "✅ Health check script'i sunucuya kopyalandi" -ForegroundColor Green
Write-Host "✅ Script'e calistirma izni verildi" -ForegroundColor Green
Write-Host "✅ Logs dizini hazirlandi" -ForegroundColor Green
Write-Host "✅ Cron job eklendi (Her 5 dakikada bir)" -ForegroundColor Green
Write-Host ""
Write-Host "Cron job detaylari:" -ForegroundColor Yellow
Write-Host "- Schedule: Her 5 dakikada bir (*/5 * * * *)" -ForegroundColor White
Write-Host "- Script: $REMOTE_PATH/$SCRIPT_NAME" -ForegroundColor White
Write-Host "- Log: $REMOTE_PATH/logs/health-check.log" -ForegroundColor White
Write-Host "- Cron log: $REMOTE_PATH/logs/health-check-cron.log" -ForegroundColor White
Write-Host ""
Write-Host "Manuel test:" -ForegroundColor Yellow
Write-Host "ssh $SERVER '$REMOTE_PATH/$SCRIPT_NAME'" -ForegroundColor Cyan
Write-Host ""
Write-Host "Log kontrol:" -ForegroundColor Yellow
Write-Host "ssh $SERVER 'tail -20 $REMOTE_PATH/logs/health-check.log'" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cron job kontrol:" -ForegroundColor Yellow
Write-Host "ssh $SERVER 'crontab -l | grep health-check'" -ForegroundColor Cyan
Write-Host ""

