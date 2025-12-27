# Deploy Script - Kategori ve Resim Düzeltmeleri
# Tarih: $(Get-Date -Format "yyyy-MM-dd HH:mm")

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy Başlatılıyor..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Değiştirilen dosyalar
$files = @(
    "src/components/featured-ads.tsx",
    "src/components/latest-ads.tsx",
    "src/app/kategori/[slug]/page.tsx",
    "src/app/page.tsx",
    "src/components/listing-card.tsx"
)

Write-Host "Değiştirilen Dosyalar:" -ForegroundColor Yellow
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (BULUNAMADI)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Sunucuya bağlanılıyor..." -ForegroundColor Yellow

# Deploy komutu
$deployCommand = @"
cd /var/www/alo17 && 
pm2 stop alo17 2>/dev/null || true && 
npm install && 
npm run build && 
pm2 restart alo17 || pm2 start npm --name alo17 -- start
"@

Write-Host ""
Write-Host "Çalıştırılacak Komut:" -ForegroundColor Cyan
Write-Host $deployCommand -ForegroundColor Gray
Write-Host ""

# SSH komutunu çalıştır
ssh root@alo17.tr $deployCommand

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy Tamamlandı!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Edilmesi Gerekenler:" -ForegroundColor Yellow
Write-Host "  1. Ana sayfada ilanlar görünüyor mu?" -ForegroundColor White
Write-Host "  2. Kategori sayfalarında ilanlar görünüyor mu?" -ForegroundColor White
Write-Host "  3. Resimler düzgün görüntüleniyor mu?" -ForegroundColor White
Write-Host "  4. Base64 resimler çalışıyor mu?" -ForegroundColor White
Write-Host ""

