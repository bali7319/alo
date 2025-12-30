# Tüm Düzeltmeleri Deploy Et
# Syntax hatasını ve kategori route güncellemesini yükle

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy Başlatılıyor - Tüm Düzeltmeler" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Moderator route syntax hatasını düzelt
Write-Host "1. Moderator route syntax hatası düzeltiliyor..." -ForegroundColor Green
scp "src\app\api\moderator\listings\[id]\route.ts" root@alo17.tr:/var/www/alo17/src/app/api/moderator/listings/[id]/route.ts

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ Moderator route yükleme hatası!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Moderator route yüklendi" -ForegroundColor Gray
Write-Host ""

# 2. Kategori route güncellemesini yükle
Write-Host "2. Kategori route güncellemesi yükleniyor..." -ForegroundColor Green
scp "src\app\api\listings\category\[slug]\route.ts" root@alo17.tr:/var/www/alo17/src/app/api/listings/category/[slug]/route.ts

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ Kategori route yükleme hatası!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Kategori route yüklendi" -ForegroundColor Gray
Write-Host ""

# 3. Sunucuda build ve restart
Write-Host "3. Sunucuda build ve restart yapılıyor..." -ForegroundColor Green
ssh root@alo17.tr "cd /var/www/alo17 && rm -rf .next && npm run build && pm2 restart alo17"

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ Build/Restart hatası!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy Tamamlandı!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test: https://alo17.tr/kategori/elektronik" -ForegroundColor Yellow

