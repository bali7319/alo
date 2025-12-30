# Tam Deploy - Schema + Route Düzeltmeleri
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tam Deploy Başlatılıyor" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Prisma schema'yı yükle
Write-Host "1. Prisma schema yükleniyor..." -ForegroundColor Green
scp "prisma\schema.prisma" root@alo17.tr:/var/www/alo17/prisma/schema.prisma
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ Schema yükleme hatası!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Schema yüklendi" -ForegroundColor Gray
Write-Host ""

# 2. Moderator route'u yükle
Write-Host "2. Moderator route yükleniyor..." -ForegroundColor Green
scp "src\app\api\moderator\listings\[id]\route.ts" root@alo17.tr:/var/www/alo17/src/app/api/moderator/listings/[id]/route.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ Moderator route yükleme hatası!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Moderator route yüklendi" -ForegroundColor Gray
Write-Host ""

# 3. Kategori route'u yükle
Write-Host "3. Kategori route yükleniyor..." -ForegroundColor Green
scp "src\app\api\listings\category\[slug]\route.ts" root@alo17.tr:/var/www/alo17/src/app/api/listings/category/[slug]/route.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ Kategori route yükleme hatası!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Kategori route yüklendi" -ForegroundColor Gray
Write-Host ""

# 4. Sunucuda build ve restart
Write-Host "4. Sunucuda Prisma generate, build ve restart yapılıyor..." -ForegroundColor Green
ssh root@alo17.tr "cd /var/www/alo17 && npx prisma generate && rm -rf .next && npm run build && pm2 restart alo17"

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

