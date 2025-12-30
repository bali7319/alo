# Basit Database Fix + Deploy
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database Fix + Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Route dosyalarını yükle
Write-Host "1. Route dosyaları yükleniyor..." -ForegroundColor Green
scp "src\app\api\moderator\listings\[id]\route.ts" root@alo17.tr:/var/www/alo17/src/app/api/moderator/listings/[id]/route.ts
scp "src\app\api\listings\category\[slug]\route.ts" root@alo17.tr:/var/www/alo17/src/app/api/listings/category/[slug]/route.ts
Write-Host "   ✓ Route dosyaları yüklendi" -ForegroundColor Gray
Write-Host ""

# 2. Sunucuda SQL çalıştır, build ve restart
Write-Host "2. Sunucuda database fix, build ve restart yapılıyor..." -ForegroundColor Green
Write-Host "   (PostgreSQL şifresini girmeniz gerekecek)" -ForegroundColor Yellow
ssh root@alo17.tr "cd /var/www/alo17 && psql -U alo17_user -d alo17_db -c \"ALTER TABLE \\\"Listing\\\" ADD COLUMN IF NOT EXISTS \\\"moderatorId\\\" TEXT, ADD COLUMN IF NOT EXISTS \\\"moderatedAt\\\" TIMESTAMP, ADD COLUMN IF NOT EXISTS \\\"moderatorNotes\\\" TEXT;\" && psql -U alo17_user -d alo17_db -c \"DO \\\$\\\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Listing_moderatorId_fkey') THEN ALTER TABLE \\\"Listing\\\" ADD CONSTRAINT \\\"Listing_moderatorId_fkey\\\" FOREIGN KEY (\\\"moderatorId\\\") REFERENCES \\\"User\\\"(\\\"id\\\") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END \\\$\\\$;\" && npx prisma generate && rm -rf .next && npm run build && pm2 restart alo17"

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠ Hata olabilir, manuel kontrol gerekebilir" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy Tamamlandı!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

