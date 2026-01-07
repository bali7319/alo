# Telefon Numarası Sorun Çözüm Scripti
# Veritabanında telefon var mı, ENCRYPTION_KEY var mı kontrol eder

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "TELEFON NUMARASI SORUN COZUM" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. ENCRYPTION_KEY kontrolu..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && if grep -q 'ENCRYPTION_KEY' .env; then echo 'ENCRYPTION_KEY VAR'; grep 'ENCRYPTION_KEY' .env | head -1 | sed 's/=.*/=***HIDDEN***/'; else echo 'ENCRYPTION_KEY YOK!'; fi" 2>&1

Write-Host "`n2. Veritabaninda telefon numarasi sayisi..." -ForegroundColor Yellow
Write-Host "   (SQL sorgusu calistiriliyor...)" -ForegroundColor Gray
$sql = "SELECT COUNT(*) as total_users, COUNT(phone) as users_with_phone FROM User;"
$sql | ssh $SERVER "cd $REMOTE_PATH && npx prisma db execute --stdin" 2>&1

Write-Host "`n3. PM2 loglarinda telefon ile ilgili son mesajlar..." -ForegroundColor Yellow
ssh $SERVER "pm2 logs alo17 --lines 100 --nostream 2>&1 | grep -i 'telefon\|phone\|decrypt\|ENCRYPTION' | tail -10" 2>&1

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "KONTROL TAMAMLANDI!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "`nNotlar:" -ForegroundColor Yellow
Write-Host "- Eger 'users_with_phone' 0 ise, veritabaninda telefon numarasi yok" -ForegroundColor White
Write-Host "- Eger ENCRYPTION_KEY yoksa, .env dosyasina eklenmeli" -ForegroundColor White
Write-Host "- PM2 loglarinda 'Telefon cozuldu' veya 'Telefon cozulemedi' mesajlari gorunmeli" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan

