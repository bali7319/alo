# Google OAuth Credentials Ekleme
# Sunucudaki .env dosyasına Google OAuth credentials ekler

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "GOOGLE OAUTH CREDENTIALS EKLEME" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Kullanıcıdan değerleri al
Write-Host "Google OAuth bilgilerini girin:" -ForegroundColor Yellow
Write-Host ""

$clientId = Read-Host "GOOGLE_CLIENT_ID"
if ([string]::IsNullOrWhiteSpace($clientId)) {
    Write-Host "GOOGLE_CLIENT_ID boş olamaz!" -ForegroundColor Red
    exit 1
}

$clientSecret = Read-Host "GOOGLE_CLIENT_SECRET"
if ([string]::IsNullOrWhiteSpace($clientSecret)) {
    Write-Host "GOOGLE_CLIENT_SECRET boş olamaz!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Sunucuya ekleniyor..." -ForegroundColor Yellow

# Mevcut .env dosyasını yedekle
ssh $SERVER "cd $REMOTE_PATH; cp .env .env.backup.$(date +%Y%m%d_%H%M%S)" 2>&1 | Out-Null
Write-Host "   .env dosyası yedeklendi" -ForegroundColor Gray

# GOOGLE_CLIENT_ID'i ekle/güncelle
$clientIdResult = ssh $SERVER "cd $REMOTE_PATH; if grep -q '^GOOGLE_CLIENT_ID=' .env; then sed -i 's|^GOOGLE_CLIENT_ID=.*|GOOGLE_CLIENT_ID=$clientId|' .env; else echo 'GOOGLE_CLIENT_ID=$clientId' >> .env; fi" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ GOOGLE_CLIENT_ID eklendi/güncellendi" -ForegroundColor Green
} else {
    Write-Host "   ✗ GOOGLE_CLIENT_ID eklenirken hata oluştu" -ForegroundColor Red
    exit 1
}

# GOOGLE_CLIENT_SECRET'i ekle/güncelle
$clientSecretResult = ssh $SERVER "cd $REMOTE_PATH; if grep -q '^GOOGLE_CLIENT_SECRET=' .env; then sed -i 's|^GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET=$clientSecret|' .env; else echo 'GOOGLE_CLIENT_SECRET=$clientSecret' >> .env; fi" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ GOOGLE_CLIENT_SECRET eklendi/güncellendi" -ForegroundColor Green
} else {
    Write-Host "   ✗ GOOGLE_CLIENT_SECRET eklenirken hata oluştu" -ForegroundColor Red
    exit 1
}

# NEXTAUTH_URL kontrolü ve ekleme
$nextAuthUrl = ssh $SERVER "cd $REMOTE_PATH; grep NEXTAUTH_URL .env 2>/dev/null | cut -d'=' -f2" 2>&1
if (-not $nextAuthUrl -or $nextAuthUrl.Trim() -eq "" -or $nextAuthUrl -like "*error*") {
    Write-Host "   NEXTAUTH_URL eksik, ekleniyor..." -ForegroundColor Yellow
    ssh $SERVER "cd $REMOTE_PATH; echo 'NEXTAUTH_URL=https://alo17.tr' >> .env" 2>&1 | Out-Null
    Write-Host "   ✓ NEXTAUTH_URL eklendi" -ForegroundColor Green
} else {
    $nextAuthUrlClean = $nextAuthUrl.Trim()
    if ($nextAuthUrlClean -notlike "*alo17.tr*") {
        Write-Host "   ⚠ NEXTAUTH_URL güncelleniyor..." -ForegroundColor Yellow
        ssh $SERVER "cd $REMOTE_PATH; sed -i 's|^NEXTAUTH_URL=.*|NEXTAUTH_URL=https://alo17.tr|' .env" 2>&1 | Out-Null
        Write-Host "   ✓ NEXTAUTH_URL güncellendi" -ForegroundColor Green
    } else {
        Write-Host "   ✓ NEXTAUTH_URL zaten doğru: $nextAuthUrlClean" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "PM2 yeniden başlatılıyor..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH; pm2 restart alo17 && pm2 save" 2>&1 | Out-Null
Write-Host "   ✓ PM2 yeniden başlatıldı" -ForegroundColor Green

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "TAMAMLANDI!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Önemli:" -ForegroundColor Yellow
Write-Host "- Google Cloud Console'da callback URL'in şu olduğundan emin olun:" -ForegroundColor White
Write-Host "  https://alo17.tr/api/auth/callback/google" -ForegroundColor Cyan
Write-Host "- Test edin: https://alo17.tr/giris" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan

