# Telefon Numarası Kontrol Scripti
# Veritabanında telefon numaralarını kontrol eder

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "TELEFON NUMARASI KONTROLU" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Telefon numarasi sayisi ozeti..." -ForegroundColor Yellow
$sql1 = "SELECT COUNT(*) as total_users, COUNT(phone) as users_with_phone, SUM(CASE WHEN phone LIKE '%:%' THEN 1 ELSE 0 END) as encrypted_count FROM User;"
echo $sql1 | ssh $SERVER "cd $REMOTE_PATH && npx prisma db execute --stdin" 2>&1

Write-Host "`n2. Ilk 10 kullanicinin telefon durumu..." -ForegroundColor Yellow
$sql2 = "SELECT id, name, email, CASE WHEN phone IS NULL THEN 'NULL' WHEN phone = '' THEN 'EMPTY' WHEN phone LIKE '%:%' THEN 'ENCRYPTED' ELSE 'PLAIN' END as phone_type, LENGTH(phone) as phone_length, SUBSTR(phone, 1, 30) as phone_preview FROM User WHERE phone IS NOT NULL AND phone != '' LIMIT 10;"
echo $sql2 | ssh $SERVER "cd $REMOTE_PATH && npx prisma db execute --stdin" 2>&1

Write-Host "`n3. PM2 loglarinda telefon ile ilgili mesajlar..." -ForegroundColor Yellow
ssh $SERVER "pm2 logs alo17 --lines 50 --nostream | grep -i 'telefon\|phone\|decrypt'" 2>&1

Write-Host "`n4. ENCRYPTION_KEY kontrolu..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && grep ENCRYPTION_KEY .env | head -1" 2>&1

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "KONTROL TAMAMLANDI!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "`nNotlar:" -ForegroundColor Yellow
Write-Host "- Eger 'users_with_phone' 0 ise, telefon numaralari kayit sirasinda alinmamis" -ForegroundColor White
Write-Host "- Eger 'encrypted_count' > 0 ise, telefon numaralari sifrelenmis" -ForegroundColor White
Write-Host "- PM2 loglarinda 'Telefon cozuldu' mesajlari gorunmeli" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan

