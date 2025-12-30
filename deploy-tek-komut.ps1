# Tek Komut Deploy - Kategori Route Güncellemesi
# PowerShell'den çalıştır: .\deploy-tek-komut.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy Başlatılıyor..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Güncellenmiş dosyayı yükle
Write-Host "1. Güncellenmiş dosya yükleniyor..." -ForegroundColor Green
scp "src\app\api\listings\category\[slug]\route.ts" root@alo17.tr:/var/www/alo17/src/app/api/listings/category/[slug]/route.ts

if ($LASTEXITCODE -ne 0) {
    Write-Host "Dosya yükleme hatası!" -ForegroundColor Red
    exit 1
}

Write-Host "   ✓ Dosya yüklendi" -ForegroundColor Gray
Write-Host ""

# Sunucuda build ve restart
Write-Host "2. Sunucuda build ve restart yapılıyor..." -ForegroundColor Green
ssh root@alo17.tr "cd /var/www/alo17 && rm -rf .next && npm run build && pm2 restart alo17 && pm2 logs alo17 --err --lines 10 --nostream"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy Tamamlandı!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test: https://alo17.tr/kategori/elektronik" -ForegroundColor Yellow

