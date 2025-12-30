# İlan Verme Akışı Deploy Script
# PowerShell'de çalıştırın

Write-Host "Build basarili! Sunucuya yukleniyor..." -ForegroundColor Green

# .next klasörünü yükle
Write-Host "1. Build dosyalari yukleniyor..." -ForegroundColor Yellow
scp -r .next root@alo17.tr:/var/www/alo17/

# Yeni ve güncellenen dosyaları yükle
Write-Host "2. Yeni ilan onizle sayfasi yukleniyor..." -ForegroundColor Yellow
ssh root@alo17.tr "mkdir -p /var/www/alo17/src/app/ilan-ver/onizle/[id]"
scp src/app/ilan-ver/onizle/[id]/page.tsx root@alo17.tr:/var/www/alo17/src/app/ilan-ver/onizle/[id]/page.tsx

Write-Host "3. Guncellenen dosyalar yukleniyor..." -ForegroundColor Yellow
scp src/app/ilan-ver/page.tsx root@alo17.tr:/var/www/alo17/src/app/ilan-ver/page.tsx
scp src/app/fatura/[id]/page.tsx root@alo17.tr:/var/www/alo17/src/app/fatura/[id]/page.tsx
scp src/app/api/listings/[id]/route.ts root@alo17.tr:/var/www/alo17/src/app/api/listings/[id]/route.ts
scp src/app/kategori/elektronik/[subSlug]/page.tsx root@alo17.tr:/var/www/alo17/src/app/kategori/elektronik/[subSlug]/page.tsx
scp src/app/kategori/ev-ve-bahce/[subSlug]/page.tsx root@alo17.tr:/var/www/alo17/src/app/kategori/ev-ve-bahce/[subSlug]/page.tsx

# PM2'yi restart et
Write-Host "4. PM2 restart ediliyor..." -ForegroundColor Yellow
ssh root@alo17.tr "cd /var/www/alo17 && pm2 restart all"

Write-Host "`nDeploy tamamlandi! ✅" -ForegroundColor Green
Write-Host "Yeni ozellikler:" -ForegroundColor Cyan
Write-Host "  - İlan onizleme sayfasi eklendi" -ForegroundColor White
Write-Host "  - İlan ver -> Onizle -> Odeme -> Fatura -> Onaya gonder akisi" -ForegroundColor White

