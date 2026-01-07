# Sunucu Performans Analizi
$SERVER = "root@alo17.tr"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "SUNUCU PERFORMANS ANALIZI" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. PM2 Process'leri
Write-Host "1. PM2 Process'leri kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER 'pm2 list'
Write-Host ""

# 2. CPU Kullanımı (Top 10)
Write-Host "2. CPU kullanimini kontrol ediliyor (Top 10)..." -ForegroundColor Yellow
ssh $SERVER 'ps aux --sort=-%cpu | head -11'
Write-Host ""

# 3. Memory Kullanımı (Top 10)
Write-Host "3. Memory kullanimini kontrol ediliyor (Top 10)..." -ForegroundColor Yellow
ssh $SERVER 'ps aux --sort=-%mem | head -11'
Write-Host ""

# 4. Node Process'leri
Write-Host "4. Node process'leri kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER 'ps aux | grep node | grep -v grep'
Write-Host ""

# 5. Load Average
Write-Host "5. Load Average kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER 'uptime'
Write-Host ""

# 6. Disk Kullanımı
Write-Host "6. Disk kullanimini kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER 'df -h'
Write-Host ""

# 7. PM2 Log Boyutları
Write-Host "7. PM2 log boyutlari kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER 'du -sh /var/www/alo17/logs/* 2>/dev/null | sort -h'
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ONERILER" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Eger CPU cok yuksekse:" -ForegroundColor Red
Write-Host "1. PM2'yi yeniden baslat: ssh $SERVER 'pm2 restart all'" -ForegroundColor Cyan
Write-Host "2. Gereksiz process'leri durdur" -ForegroundColor Cyan
Write-Host "3. Next.js build process'i kontrol et" -ForegroundColor Cyan
Write-Host "4. Database sorgularini optimize et" -ForegroundColor Cyan
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan

