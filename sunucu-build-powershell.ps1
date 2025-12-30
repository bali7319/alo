# PowerShell script - Sunucuda build için
# Kullanım: .\sunucu-build-powershell.ps1

param(
    [string]$ServerIP = "your-server-ip",
    [string]$SSHUser = "root"
)

Write-Host "🚀 Sunucuda build başlatılıyor..." -ForegroundColor Green
Write-Host "📡 Sunucu: $SSHUser@$ServerIP" -ForegroundColor Cyan

# Script içeriğini hazırla
$buildScript = @"
cd /var/www/alo17
echo '📦 Cache temizleniyor...'
rm -rf .next/cache
rm -rf .next
echo '🔧 Prisma client oluşturuluyor...'
npx prisma generate
echo '🔨 Build yapılıyor (bu biraz zaman alabilir)...'
npm run build
if [ `$? -eq 0 ]; then
    echo '✅ Build başarılı!'
    echo '🔄 PM2 restart ediliyor...'
    pm2 restart alo17
    echo '📋 Son loglar:'
    pm2 logs alo17 --err --lines 10 --nostream
    echo '✅ Tüm işlemler tamamlandı!'
else
    echo '❌ Build başarısız! Lütfen hataları kontrol edin.'
    exit 1
fi
"@

# SSH ile komutları çalıştır
Write-Host "`n📤 Komutlar sunucuya gönderiliyor..." -ForegroundColor Yellow
ssh "$SSHUser@$ServerIP" $buildScript

Write-Host "`n✅ İşlem tamamlandı!" -ForegroundColor Green

