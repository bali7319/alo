# Sunucuya Google OAuth Kurulum Script'i
# Kullanım: .\sunucu-google-oauth-kur.ps1 -ServerIP "your-server-ip" -Username "your-username"

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [string]$ProjectPath = "/var/www/alo17"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Sunucuya Google OAuth Kurulumu" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Sunucu: ${Username}@${ServerIP}" -ForegroundColor Yellow
Write-Host "Proje Yolu: ${ProjectPath}" -ForegroundColor Yellow
Write-Host ""

$sshCommand = "ssh ${Username}@${ServerIP}"

# 1. SSH Bağlantı Testi
Write-Host "1. SSH Bağlantı Testi..." -ForegroundColor Green
try {
    $result = & $sshCommand "echo 'SSH bağlantısı başarılı'" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ SSH bağlantısı çalışıyor" -ForegroundColor Green
    } else {
        Write-Host "✗ SSH bağlantısı başarısız" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ SSH bağlantısı başarısız: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Proje dizinine git
Write-Host "2. Proje dizini kontrol ediliyor..." -ForegroundColor Green
$projectCheck = & $sshCommand "cd ${ProjectPath} && pwd" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Proje dizini bulunamadı: ${ProjectPath}" -ForegroundColor Red
    Write-Host "Lütfen doğru proje yolunu belirtin." -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Proje dizini bulundu" -ForegroundColor Green

Write-Host ""

# 3. .env dosyası kontrolü
Write-Host "3. .env dosyası kontrol ediliyor..." -ForegroundColor Green
$envCheck = & $sshCommand "cd ${ProjectPath} && if [ -f .env ]; then echo 'EXISTS'; else echo 'NOT_EXISTS'; fi" 2>&1
if ($envCheck -match "NOT_EXISTS") {
    Write-Host "⚠ .env dosyası bulunamadı, oluşturuluyor..." -ForegroundColor Yellow
    & $sshCommand "cd ${ProjectPath} && touch .env"
} else {
    Write-Host "✓ .env dosyası mevcut" -ForegroundColor Green
}

Write-Host ""

# 4. Mevcut .env içeriğini göster
Write-Host "4. Mevcut .env içeriği:" -ForegroundColor Green
& $sshCommand "cd ${ProjectPath} && cat .env" 2>&1

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Google OAuth Bilgilerini Girin" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Google Cloud Console'dan alın:" -ForegroundColor Yellow
Write-Host "https://console.cloud.google.com/apis/credentials?project=jovial-circuit-460514-j9" -ForegroundColor Cyan
Write-Host ""

$clientId = Read-Host "Google Client ID'yi girin"
$clientSecret = Read-Host "Google Client Secret'ı girin"

# Production domain bilgisi
Write-Host ""
$productionDomain = Read-Host "Production domain'inizi girin (örn: alo17.tr) [Enter'a basarak atlayabilirsiniz]"
if ([string]::IsNullOrWhiteSpace($productionDomain)) {
    $productionDomain = "alo17.tr"
}

# NEXTAUTH_SECRET oluştur
Write-Host ""
Write-Host "5. NEXTAUTH_SECRET oluşturuluyor..." -ForegroundColor Green
$nextAuthSecret = & $sshCommand "cd ${ProjectPath} && node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"" 2>&1
if ($LASTEXITCODE -ne 0) {
    # Node.js yoksa openssl kullan
    $nextAuthSecret = & $sshCommand "openssl rand -base64 32" 2>&1
}

Write-Host "✓ NEXTAUTH_SECRET oluşturuldu" -ForegroundColor Green

Write-Host ""

# 6. .env dosyasını güncelle
Write-Host "6. .env dosyası güncelleniyor..." -ForegroundColor Green

# Mevcut değerleri kontrol et ve güncelle
$updateEnvScript = @"
cd ${ProjectPath}

# Google OAuth değerlerini güncelle/ekle
if grep -q "GOOGLE_CLIENT_ID=" .env; then
    sed -i 's|GOOGLE_CLIENT_ID=.*|GOOGLE_CLIENT_ID=${clientId}|' .env
else
    echo "GOOGLE_CLIENT_ID=${clientId}" >> .env
fi

if grep -q "GOOGLE_CLIENT_SECRET=" .env; then
    sed -i 's|GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET=${clientSecret}|' .env
else
    echo "GOOGLE_CLIENT_SECRET=${clientSecret}" >> .env
fi

# NEXTAUTH_URL güncelle
if grep -q "NEXTAUTH_URL=" .env; then
    sed -i 's|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://${productionDomain}|' .env
else
    echo "NEXTAUTH_URL=https://${productionDomain}" >> .env
fi

# NEXTAUTH_SECRET güncelle
if grep -q "NEXTAUTH_SECRET=" .env; then
    sed -i 's|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=${nextAuthSecret}|' .env
else
    echo "NEXTAUTH_SECRET=${nextAuthSecret}" >> .env
fi

echo "✓ .env dosyası güncellendi"
"@

& $sshCommand $updateEnvScript

Write-Host ""

# 7. Güncellenmiş .env içeriğini göster
Write-Host "7. Güncellenmiş .env içeriği (gizli bilgiler maskelenmiş):" -ForegroundColor Green
$envContent = & $sshCommand "cd ${ProjectPath} && cat .env" 2>&1
$envContent = $envContent -replace 'GOOGLE_CLIENT_SECRET=.*', 'GOOGLE_CLIENT_SECRET=***MASKED***'
$envContent = $envContent -replace 'NEXTAUTH_SECRET=.*', 'NEXTAUTH_SECRET=***MASKED***'
Write-Host $envContent

Write-Host ""

# 8. PM2 ile uygulamayı yeniden başlat
Write-Host "8. Uygulama yeniden başlatılıyor..." -ForegroundColor Green
$restartResult = & $sshCommand "cd ${ProjectPath} && pm2 restart alo17 2>&1 || pm2 restart all 2>&1 || echo 'PM2 komutu bulunamadı, manuel olarak yeniden başlatın'" 2>&1
Write-Host $restartResult

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✓ Kurulum Tamamlandı!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Önemli Notlar:" -ForegroundColor Yellow
Write-Host "1. Google Cloud Console'da Authorized redirect URIs'e ekleyin:" -ForegroundColor White
Write-Host "   https://${productionDomain}/api/auth/callback/google" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Authorized JavaScript origins'e ekleyin:" -ForegroundColor White
Write-Host "   https://${productionDomain}" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Uygulama yeniden başlatıldı. Test edin:" -ForegroundColor White
Write-Host "   https://${productionDomain}/giris" -ForegroundColor Cyan
Write-Host ""

