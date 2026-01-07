# Google OAuth Credentials Deploy
# JSON dosyasından credentials alıp sunucuya ekler

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"

# JSON dosyasından bilgileri oku
$jsonPath = "C:\Users\bali\Downloads\client_secret_2_994791867914-6qsiuaag21nqvoms853n9rlkkhub0jap.apps.googleusercontent.com.json"
$jsonContent = Get-Content $jsonPath | ConvertFrom-Json

$clientId = $jsonContent.web.client_id
$clientSecret = $jsonContent.web.client_secret

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "GOOGLE OAUTH CREDENTIALS DEPLOY" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Client ID: $($clientId.Substring(0, [Math]::Min(30, $clientId.Length)))..." -ForegroundColor Gray
Write-Host "Client Secret: $($clientSecret.Substring(0, [Math]::Min(20, $clientSecret.Length)))..." -ForegroundColor Gray
Write-Host ""

Write-Host "Sunucuya ekleniyor..." -ForegroundColor Yellow

# Mevcut .env dosyasını yedekle
ssh $SERVER "cd $REMOTE_PATH; cp .env .env.backup.`$(date +%Y%m%d_%H%M%S)" 2>&1 | Out-Null
Write-Host "   .env dosyası yedeklendi" -ForegroundColor Gray

# Geçici script dosyası oluştur
$tempScriptContent = @'
#!/bin/bash
cd REMOTE_PATH_PLACEHOLDER

# GOOGLE_CLIENT_ID ekle/güncelle
if grep -q '^GOOGLE_CLIENT_ID=' .env; then
    sed -i 's|^GOOGLE_CLIENT_ID=.*|GOOGLE_CLIENT_ID=CLIENT_ID_PLACEHOLDER|' .env
else
    echo 'GOOGLE_CLIENT_ID=CLIENT_ID_PLACEHOLDER' >> .env
fi

# GOOGLE_CLIENT_SECRET ekle/güncelle
if grep -q '^GOOGLE_CLIENT_SECRET=' .env; then
    sed -i 's|^GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET=CLIENT_SECRET_PLACEHOLDER|' .env
else
    echo 'GOOGLE_CLIENT_SECRET=CLIENT_SECRET_PLACEHOLDER' >> .env
fi

# NEXTAUTH_URL kontrolü ve ekleme
if ! grep -q '^NEXTAUTH_URL=' .env || ! grep '^NEXTAUTH_URL=' .env | grep -q 'alo17.tr'; then
    if grep -q '^NEXTAUTH_URL=' .env; then
        sed -i 's|^NEXTAUTH_URL=.*|NEXTAUTH_URL=https://alo17.tr|' .env
    else
        echo 'NEXTAUTH_URL=https://alo17.tr' >> .env
    fi
fi
'@

# Placeholder'ları değiştir
$tempScriptContent = $tempScriptContent -replace 'REMOTE_PATH_PLACEHOLDER', $REMOTE_PATH
$tempScriptContent = $tempScriptContent -replace 'CLIENT_ID_PLACEHOLDER', $clientId
$tempScriptContent = $tempScriptContent -replace 'CLIENT_SECRET_PLACEHOLDER', $clientSecret

# Geçici script dosyasını oluştur ve sunucuya gönder
$tempScriptPath = "$env:TEMP\update_google_oauth.sh"
$tempScriptContent | Out-File -FilePath $tempScriptPath -Encoding UTF8

scp $tempScriptPath "$SERVER`:/tmp/update_google_oauth.sh" 2>&1 | Out-Null
$result = ssh $SERVER "chmod +x /tmp/update_google_oauth.sh; /tmp/update_google_oauth.sh; rm /tmp/update_google_oauth.sh" 2>&1

Remove-Item $tempScriptPath -ErrorAction SilentlyContinue

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ GOOGLE_CLIENT_ID eklendi/güncellendi" -ForegroundColor Green
    Write-Host "   ✓ GOOGLE_CLIENT_SECRET eklendi/güncellendi" -ForegroundColor Green
    Write-Host "   ✓ NEXTAUTH_URL kontrol edildi" -ForegroundColor Green
} else {
    Write-Host "   ✗ Hata oluştu: $result" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "PM2 yeniden başlatılıyor..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH; pm2 restart alo17; pm2 save" 2>&1 | Out-Null
Write-Host "   ✓ PM2 yeniden başlatıldı" -ForegroundColor Green

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "DEPLOY TAMAMLANDI!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Kontrol:" -ForegroundColor Yellow
Write-Host "- Callback URL'ler JSON'da doğru görünüyor:" -ForegroundColor White
Write-Host "  ✓ https://alo17.tr/api/auth/callback/google" -ForegroundColor Green
Write-Host "  ✓ https://www.alo17.tr/api/auth/callback/google" -ForegroundColor Green
Write-Host "- Test edin: https://alo17.tr/giris" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan
