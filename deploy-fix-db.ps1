# Database Fix + Deploy
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database Fix + Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. SQL dosyasını yükle
Write-Host "1. SQL fix dosyası yükleniyor..." -ForegroundColor Green
scp "fix-database-manual.sql" root@alo17.tr:/var/www/alo17/fix-database-manual.sql
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ SQL dosyası yükleme hatası!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ SQL dosyası yüklendi" -ForegroundColor Gray
Write-Host ""

# 2. Route dosyalarını yükle
Write-Host "2. Route dosyaları yükleniyor..." -ForegroundColor Green
scp "src\app\api\moderator\listings\[id]\route.ts" root@alo17.tr:/var/www/alo17/src/app/api/moderator/listings/[id]/route.ts
scp "src\app\api\listings\category\[slug]\route.ts" root@alo17.tr:/var/www/alo17/src/app/api/listings/category/[slug]/route.ts
Write-Host "   ✓ Route dosyaları yüklendi" -ForegroundColor Gray
Write-Host ""

# 3. Sunucuda SQL çalıştır, build ve restart
Write-Host "3. Sunucuda database fix, build ve restart yapılıyor..." -ForegroundColor Green
ssh root@alo17.tr "cd /var/www/alo17 && PGPASSWORD=\$(grep DATABASE_URL .env | cut -d: -f3 | cut -d@ -f1) psql -h localhost -U alo17_user -d alo17_db -f fix-database-manual.sql && npx prisma generate && rm -rf .next && npm run build && pm2 restart alo17"

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠ Hata olabilir, manuel kontrol gerekebilir" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy Tamamlandı!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Not: Eğer SQL hatası varsa, sunucuda manuel olarak çalıştırın:" -ForegroundColor Yellow
Write-Host "   psql -U alo17_user -d alo17_db -f fix-database-manual.sql" -ForegroundColor Gray
Write-Host ""

