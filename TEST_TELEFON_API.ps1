# Telefon Numarası API Test Scripti
# API'yi test edip logları kontrol eder

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"
$SITE_URL = "https://alo17.tr"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "TELEFON NUMARASI API TESTI" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. PM2 loglarini kontrol ediyoruz (telefon ile ilgili)..." -ForegroundColor Yellow
ssh $SERVER "pm2 logs alo17 --lines 50 --nostream | grep -i 'telefon\|phone\|decrypt'" 2>&1

Write-Host "`n2. API endpoint'ini test ediyoruz..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$SITE_URL/api/admin/users?page=1&limit=5" -Method GET -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   API yanit verdi: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "   Kullanici sayisi: $($data.users.Count)" -ForegroundColor Cyan
        
        Write-Host "`n   Ilk 5 kullanicinin telefon numaralari:" -ForegroundColor Yellow
        $data.users | Select-Object -First 5 | ForEach-Object {
            $phone = if ($_.phone) { $_.phone } else { "YOK" }
            Write-Host "   - $($_.name): $phone" -ForegroundColor White
        }
    } else {
        Write-Host "   API hatasi: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "   API hatasi: $_" -ForegroundColor Red
}

Write-Host "`n3. Database'deki telefon numaralari kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && npx prisma db execute --stdin" <<< "SELECT id, name, email, CASE WHEN phone IS NULL THEN 'NULL' WHEN phone = '' THEN 'EMPTY' WHEN phone LIKE '%:%' THEN 'ENCRYPTED' ELSE 'PLAIN' END as phone_type, LENGTH(phone) as phone_length FROM User WHERE phone IS NOT NULL AND phone != '' LIMIT 5;" 2>&1

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "TEST TAMAMLANDI!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "`nNotlar:" -ForegroundColor Yellow
Write-Host "- Eger telefon numaralari 'ENCRYPTED' ise, sifre cozme calismali" -ForegroundColor White
Write-Host "- Eger telefon numaralari 'NULL' veya 'EMPTY' ise, kayit sirasinda alinmamis" -ForegroundColor White
Write-Host "- PM2 loglarinda 'Telefon cozuldu' mesajlari gorunmeli" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan

