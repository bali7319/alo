# 401 Unauthorized Hatası - Teşhis Scripti

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "401 UNAUTHORIZED HATASI - TESHIS" -ForegroundColor Red
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. NEXTAUTH_SECRET kontrolü
Write-Host "1. NEXTAUTH_SECRET kontrol ediliyor..." -ForegroundColor Yellow
$secretCheck = ssh $SERVER "cd $REMOTE_PATH && grep NEXTAUTH_SECRET .env | head -1" 2>&1
if ($secretCheck -match "NEXTAUTH_SECRET") {
    Write-Host "✅ NEXTAUTH_SECRET mevcut" -ForegroundColor Green
    $secretValue = $secretCheck -replace "NEXTAUTH_SECRET=", ""
    if ($secretValue.Length -lt 32) {
        Write-Host "⚠️  NEXTAUTH_SECRET çok kısa (en az 32 karakter olmalı)" -ForegroundColor Yellow
    } else {
        Write-Host "✅ NEXTAUTH_SECRET uzunluğu yeterli" -ForegroundColor Green
    }
} else {
    Write-Host "❌ NEXTAUTH_SECRET bulunamadı!" -ForegroundColor Red
}
Write-Host ""

# 2. PM2 logları (auth hataları)
Write-Host "2. PM2 logları kontrol ediliyor (auth hataları)..." -ForegroundColor Yellow
ssh $SERVER "pm2 logs alo17 --lines 50 --nostream 2>&1 | grep -iE 'auth|401|unauthorized|credentials|error' | tail -20" 2>&1
Write-Host ""

# 3. Database bağlantı testi
Write-Host "3. Database bağlantı testi..." -ForegroundColor Yellow
$dbTest = ssh $SERVER "cd $REMOTE_PATH && npx prisma db execute --stdin --schema=prisma/schema.prisma <<< 'SELECT 1;'" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database bağlantısı çalışıyor" -ForegroundColor Green
} else {
    Write-Host "❌ Database bağlantı sorunu var" -ForegroundColor Red
    Write-Host $dbTest
}
Write-Host ""

# 4. Environment variables kontrolü
Write-Host "4. Environment variables kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && grep -E 'NEXTAUTH_SECRET|DATABASE_URL|NODE_ENV' .env | head -5" 2>&1
Write-Host ""

# 5. Forgot password endpoint kontrolü
Write-Host "5. Forgot password endpoint kontrol ediliyor..." -ForegroundColor Yellow
$forgotPasswordCheck = ssh $SERVER "cd $REMOTE_PATH && find src/app/api -name '*forgot*' -o -name '*password*' 2>/dev/null | head -5" 2>&1
if ($forgotPasswordCheck -match "forgot|password") {
    Write-Host "✅ Forgot password endpoint bulundu" -ForegroundColor Green
    Write-Host $forgotPasswordCheck
} else {
    Write-Host "⚠️  Forgot password endpoint bulunamadı" -ForegroundColor Yellow
}
Write-Host ""

# 6. Site durumu
Write-Host "6. Site durumu kontrol ediliyor..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://alo17.tr/api/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Site erişilebilir" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Site erişilemiyor: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "TESHis TAMAMLANDI" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Onerilen cozumler:" -ForegroundColor Yellow
Write-Host "1. NEXTAUTH_SECRET eksikse ekleyin:" -ForegroundColor White
Write-Host "   ssh $SERVER 'cd $REMOTE_PATH && echo \"NEXTAUTH_SECRET=$(openssl rand -base64 32)\" >> .env'" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. PM2'yi yeniden başlatın:" -ForegroundColor White
Write-Host "   ssh $SERVER 'cd $REMOTE_PATH && pm2 restart alo17 && pm2 save'" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Forgot password endpoint'i kontrol edin" -ForegroundColor White
Write-Host ""

