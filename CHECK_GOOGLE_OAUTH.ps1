# Google OAuth Yapılandırma Kontrolü
# Sunucudaki Google OAuth ayarlarını kontrol eder

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "GOOGLE OAUTH YAPILANDIRMA KONTROLU" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Environment Variable'lar kontrol ediliyor..." -ForegroundColor Yellow
Write-Host ""

# GOOGLE_CLIENT_ID kontrolü
$clientId = ssh $SERVER "cd $REMOTE_PATH; grep GOOGLE_CLIENT_ID .env 2>/dev/null | cut -d'=' -f2" 2>&1
if ($clientId -and $clientId.Trim() -ne "" -and $clientId -notlike "*error*") {
    Write-Host "   ✓ GOOGLE_CLIENT_ID: Mevcut" -ForegroundColor Green
    $clientIdClean = $clientId.Trim()
    if ($clientIdClean.Length -gt 20) {
        Write-Host "     İlk 20 karakter: $($clientIdClean.Substring(0, 20))..." -ForegroundColor Gray
    } else {
        Write-Host "     Değer: $clientIdClean" -ForegroundColor Gray
    }
} else {
    Write-Host "   ✗ GOOGLE_CLIENT_ID: EKSIK!" -ForegroundColor Red
}

# GOOGLE_CLIENT_SECRET kontrolü
$clientSecret = ssh $SERVER "cd $REMOTE_PATH; grep GOOGLE_CLIENT_SECRET .env 2>/dev/null | cut -d'=' -f2" 2>&1
if ($clientSecret -and $clientSecret.Trim() -ne "" -and $clientSecret -notlike "*error*") {
    Write-Host "   ✓ GOOGLE_CLIENT_SECRET: Mevcut" -ForegroundColor Green
} else {
    Write-Host "   ✗ GOOGLE_CLIENT_SECRET: EKSIK!" -ForegroundColor Red
}

# NEXTAUTH_URL kontrolü
$nextAuthUrl = ssh $SERVER "cd $REMOTE_PATH; grep NEXTAUTH_URL .env 2>/dev/null | cut -d'=' -f2" 2>&1
if ($nextAuthUrl -and $nextAuthUrl.Trim() -ne "" -and $nextAuthUrl -notlike "*error*") {
    $nextAuthUrlClean = $nextAuthUrl.Trim()
    Write-Host "   ✓ NEXTAUTH_URL: $nextAuthUrlClean" -ForegroundColor Green
    if ($nextAuthUrlClean -notlike "*alo17.tr*") {
        Write-Host "     ⚠ UYARI: NEXTAUTH_URL production URL'i içermiyor!" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✗ NEXTAUTH_URL: EKSIK!" -ForegroundColor Red
}

# NEXTAUTH_SECRET kontrolü
$nextAuthSecret = ssh $SERVER "cd $REMOTE_PATH; grep NEXTAUTH_SECRET .env 2>/dev/null | cut -d'=' -f2" 2>&1
if ($nextAuthSecret -and $nextAuthSecret.Trim() -ne "" -and $nextAuthSecret -notlike "*error*") {
    Write-Host "   ✓ NEXTAUTH_SECRET: Mevcut" -ForegroundColor Green
} else {
    Write-Host "   ✗ NEXTAUTH_SECRET: EKSIK!" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. PM2 Log'ları kontrol ediliyor (son 20 satır)..." -ForegroundColor Yellow
Write-Host ""
$logOutput = ssh $SERVER "cd $REMOTE_PATH; pm2 logs alo17 --lines 20 --nostream 2>&1" 2>&1
$filteredLogs = $logOutput | Select-String -Pattern "google|oauth|auth" -CaseSensitive:$false
if ($filteredLogs) {
    $filteredLogs | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "   Google/OAuth ile ilgili log bulunamadı" -ForegroundColor Gray
}

Write-Host ""
Write-Host "3. NextAuth API endpoint kontrol ediliyor..." -ForegroundColor Yellow
Write-Host ""
$apiCheck = ssh $SERVER "curl -s -o /dev/null -w '%{http_code}' https://alo17.tr/api/auth/providers 2>&1" 2>&1
if ($apiCheck -eq "200") {
    Write-Host "   ✓ NextAuth API çalışıyor" -ForegroundColor Green
} else {
    Write-Host "   ✗ NextAuth API yanıt vermiyor (HTTP: $apiCheck)" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "KONTROL TAMAMLANDI" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Önemli Notlar:" -ForegroundColor Yellow
Write-Host "- Google Cloud Console'da callback URL şu olmalı:" -ForegroundColor White
Write-Host "  https://alo17.tr/api/auth/callback/google" -ForegroundColor Cyan
Write-Host "- NEXTAUTH_URL şu olmalı:" -ForegroundColor White
Write-Host "  https://alo17.tr" -ForegroundColor Cyan
Write-Host "- Environment variable'ları değiştirdikten sonra PM2'yi yeniden başlatın:" -ForegroundColor White
Write-Host "  pm2 restart alo17" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

