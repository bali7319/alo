# Sunucu Temizlik Scripti
# Gereksiz dosyaları, logları ve cache'leri temizler

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "SUNUCU TEMIZLIK" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Eski build dosyalari kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && du -sh .next 2>/dev/null || echo 'Build klasoru yok'" 2>&1

Write-Host "`n2. Eski log dosyalari kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && find logs -name '*.log' -type f -mtime +7 2>/dev/null | wc -l" 2>&1

Write-Host "`n3. Node modules boyutu kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && du -sh node_modules 2>/dev/null || echo 'Node modules yok'" 2>&1

Write-Host "`n4. PM2 log dosyalari kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER "du -sh ~/.pm2/logs 2>/dev/null || echo 'PM2 logs yok'" 2>&1

Write-Host "`n5. Eski backup dosyalari kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && find . -name '*.tar.gz' -o -name '*.bak' -o -name '*.backup' 2>/dev/null | head -10" 2>&1

Write-Host "`n6. Gecici dosyalar kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && find . -name '*.tmp' -o -name '*.temp' -o -name '.DS_Store' 2>/dev/null | head -10" 2>&1

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "TEMIZLIK BASLIYOR..." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Eski PM2 log dosyalari temizleniyor (7 gunden eski)..." -ForegroundColor Yellow
ssh $SERVER "find ~/.pm2/logs -name '*.log' -type f -mtime +7 -delete 2>/dev/null && echo 'Eski PM2 loglari silindi' || echo 'Silinecek eski log yok'" 2>&1

Write-Host "`n2. Eski application log dosyalari temizleniyor (7 gunden eski)..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && find logs -name '*.log' -type f -mtime +7 -delete 2>/dev/null && echo 'Eski loglar silindi' || echo 'Silinecek eski log yok'" 2>&1

Write-Host "`n3. Eski backup dosyalari temizleniyor..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && find . -maxdepth 1 -name '*.tar.gz' -type f -mtime +30 -delete 2>/dev/null && echo 'Eski backup dosyalari silindi' || echo 'Silinecek backup yok'" 2>&1

Write-Host "`n4. Gecici dosyalar temizleniyor..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && find . -name '*.tmp' -o -name '*.temp' -o -name '.DS_Store' -delete 2>/dev/null && echo 'Gecici dosyalar silindi' || echo 'Gecici dosya yok'" 2>&1

Write-Host "`n5. Next.js cache temizleniyor..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && rm -rf .next/cache 2>/dev/null && echo 'Next.js cache temizlendi' || echo 'Cache yok'" 2>&1

Write-Host "`n6. NPM cache temizleniyor..." -ForegroundColor Yellow
ssh $SERVER "npm cache clean --force 2>&1 | head -5" 2>&1

Write-Host "`n7. Disk kullanimi kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER "df -h / | tail -1" 2>&1

Write-Host "`n8. Temizlik sonrasi boyutlar..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && echo 'Build klasoru:' && du -sh .next 2>/dev/null || echo 'Build yok'; echo 'Node modules:' && du -sh node_modules 2>/dev/null || echo 'Node modules yok'; echo 'Logs:' && du -sh logs 2>/dev/null || echo 'Logs yok'" 2>&1

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "TEMIZLIK TAMAMLANDI!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "`nNot: Build dosyalari (.next) silinmedi (gerekli)" -ForegroundColor Gray
Write-Host "Not: Node modules silinmedi (gerekli)" -ForegroundColor Gray
Write-Host "Not: Sadece eski loglar ve gecici dosyalar temizlendi" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan

