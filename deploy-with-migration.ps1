# Deploy + Migration
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy + Database Migration" -ForegroundColor Cyan
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

# 2. Migration dosyalarını yükle
Write-Host "2. Migration dosyaları yükleniyor..." -ForegroundColor Green
scp -r "prisma\migrations" root@alo17.tr:/var/www/alo17/prisma/
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ Migration yükleme hatası!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Migration dosyaları yüklendi" -ForegroundColor Gray
Write-Host ""

# 3. Route dosyalarını yükle
Write-Host "3. Route dosyaları yükleniyor..." -ForegroundColor Green
scp "src\app\api\moderator\listings\[id]\route.ts" root@alo17.tr:/var/www/alo17/src/app/api/moderator/listings/[id]/route.ts
scp "src\app\api\listings\category\[slug]\route.ts" root@alo17.tr:/var/www/alo17/src/app/api/listings/category/[slug]/route.ts
Write-Host "   ✓ Route dosyaları yüklendi" -ForegroundColor Gray
Write-Host ""

# 4. Sunucuda migration, build ve restart
Write-Host "4. Sunucuda migration, build ve restart yapılıyor..." -ForegroundColor Green
ssh root@alo17.tr "cd /var/www/alo17 && npx prisma generate && npx prisma migrate deploy && rm -rf .next && npm run build && pm2 restart alo17"

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ Migration/Build/Restart hatası!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy Tamamlandı!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test: https://alo17.tr/kategori/elektronik" -ForegroundColor Yellow

