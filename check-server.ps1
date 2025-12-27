# Sunucu Durum Kontrol Script'i (PowerShell)
# Kullanım: .\check-server.ps1 -ServerIP "your-server-ip" -Username "your-username"

param(
    [string]$ServerIP = "your-server-ip",
    [string]$Username = "your-username"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Sunucu Durum Kontrolü" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Sunucu: ${Username}@${ServerIP}" -ForegroundColor Yellow
Write-Host ""

# SSH komutlarını çalıştırmak için
$sshCommand = "ssh ${Username}@${ServerIP}"

Write-Host "1. SSH Bağlantı Testi..." -ForegroundColor Green
try {
    $result = & $sshCommand "echo 'SSH bağlantısı başarılı'" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ SSH bağlantısı çalışıyor" -ForegroundColor Green
    } else {
        Write-Host "✗ SSH bağlantısı başarısız" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ SSH bağlantısı başarısız: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

Write-Host "2. Disk Kullanımı:" -ForegroundColor Green
& $sshCommand "df -h / | tail -1"

Write-Host ""

Write-Host "3. Bellek Kullanımı:" -ForegroundColor Green
& $sshCommand "free -h"

Write-Host ""

Write-Host "4. PM2 Durumu:" -ForegroundColor Green
& $sshCommand "pm2 list"

Write-Host ""

Write-Host "5. Next.js Uygulama Durumu:" -ForegroundColor Green
& $sshCommand "pm2 info alo17 2>/dev/null || echo 'PM2 uygulaması bulunamadı'"

Write-Host ""

Write-Host "6. Port 3000 Kontrolü:" -ForegroundColor Green
& $sshCommand "netstat -tuln | grep :3000 || ss -tuln | grep :3000 || echo 'Port 3000 dinlenmiyor'"

Write-Host ""

Write-Host "7. Son PM2 Loglar (Error):" -ForegroundColor Green
& $sshCommand "tail -10 /var/www/alo17/logs/error.log 2>/dev/null || echo 'Log dosyası bulunamadı'"

Write-Host ""

Write-Host "8. Git Durumu:" -ForegroundColor Green
& $sshCommand "cd /var/www/alo17 && git status 2>&1 | head -5"

Write-Host ""

Write-Host "9. Node.js ve NPM Versiyonları:" -ForegroundColor Green
& $sshCommand "node --version && npm --version"

Write-Host ""

Write-Host "10. .env Dosyası Kontrolü:" -ForegroundColor Green
& $sshCommand "cd /var/www/alo17 && if [ -f .env ]; then echo '✓ .env dosyası mevcut'; ls -lh .env; else echo '✗ .env dosyası bulunamadı'; fi"

Write-Host ""

Write-Host "11. Database Bağlantı Testi:" -ForegroundColor Green
& $sshCommand "cd /var/www/alo17 && npx prisma db pull --preview-feature 2>&1 | head -3 || echo 'Database bağlantı testi yapılamadı'"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Kontrol tamamlandı" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

