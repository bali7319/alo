# Eski ENCRYPTION_KEY'i bulmak için kontrol scripti

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ESKI ENCRYPTION_KEY ARAMA" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. .env backup dosyalari kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && find . -name '.env*' -o -name '*.env*' -o -name '*env*backup*' 2>/dev/null | head -20" 2>&1

Write-Host "`n2. Git history'de ENCRYPTION_KEY aramasi..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && if [ -d .git ]; then git log --all --full-history -p -- .env 2>/dev/null | grep -A 5 -B 5 'ENCRYPTION_KEY' | head -30; else echo 'Git repository bulunamadi'; fi" 2>&1

Write-Host "`n3. PM2 loglarinda ENCRYPTION_KEY aramasi..." -ForegroundColor Yellow
ssh $SERVER "pm2 logs alo17 --lines 500 --nostream 2>&1 | grep -i 'encryption\|key\|sifre' | tail -20" 2>&1

Write-Host "`n4. Veritabaninda ornek sifrelenmis telefon kontrolu..." -ForegroundColor Yellow
Write-Host "   (Sifrelenmis telefon formatini gormek icin)" -ForegroundColor Gray
$sql = "SELECT id, name, email, phone FROM User WHERE phone IS NOT NULL AND phone != '' AND phone LIKE '%:%' LIMIT 3;"
$sql | ssh $SERVER "cd $REMOTE_PATH && npx prisma db execute --stdin" 2>&1

Write-Host "`n5. Sunucuda .env dosya gecmisi..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && ls -la .env* 2>/dev/null; echo ''; cat .env 2>/dev/null | grep -v 'PASSWORD\|SECRET\|KEY' | head -10" 2>&1

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "ARAMA TAMAMLANDI!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

