# Telefon Numarası Veritabanı Kontrolü
# Veritabanında telefon numaralarının varlığını kontrol eder

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "TELEFON NUMARASI VERITABANI KONTROLU" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Telefon numarasi sayisi ozeti..." -ForegroundColor Yellow
$sql1 = "SELECT COUNT(*) as total_users, COUNT(phone) as users_with_phone, SUM(CASE WHEN phone LIKE '%:%' THEN 1 ELSE 0 END) as encrypted_count, SUM(CASE WHEN phone IS NOT NULL AND phone != '' AND phone NOT LIKE '%:%' THEN 1 ELSE 0 END) as plain_count FROM User;"
Write-Host "SQL: $sql1" -ForegroundColor Gray
$sql1 | ssh $SERVER "cd $REMOTE_PATH && npx prisma db execute --stdin" 2>&1

Write-Host "`n2. Ilk 10 kullanicinin telefon durumu..." -ForegroundColor Yellow
$sql2 = "SELECT id, name, email, CASE WHEN phone IS NULL THEN 'NULL' WHEN phone = '' THEN 'EMPTY' WHEN phone LIKE '%:%' THEN 'ENCRYPTED' ELSE 'PLAIN' END as phone_type, LENGTH(phone) as phone_length, SUBSTR(phone, 1, 40) as phone_preview FROM User ORDER BY createdAt DESC LIMIT 10;"
$sql2 | ssh $SERVER "cd $REMOTE_PATH && npx prisma db execute --stdin" 2>&1

Write-Host "`n3. Telefon numarasi olan kullanicilar (ornek)..." -ForegroundColor Yellow
$sql3 = "SELECT id, name, email, phone FROM User WHERE phone IS NOT NULL AND phone != '' LIMIT 5;"
$sql3 | ssh $SERVER "cd $REMOTE_PATH && npx prisma db execute --stdin" 2>&1

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "KONTROL TAMAMLANDI!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "`nNotlar:" -ForegroundColor Yellow
Write-Host "- 'users_with_phone': Telefon numarasi olan kullanici sayisi" -ForegroundColor White
Write-Host "- 'encrypted_count': Sifrelenmis telefon sayisi" -ForegroundColor White
Write-Host "- 'plain_count': Sifrelenmemis telefon sayisi" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan

