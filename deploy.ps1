# Alo17 Deployment Script
# Bu script güncellenmiş dosyaları sunucuya yükler ve uygulamayı yeniden başlatır

param(
    [string]$ServerIP = "alo17.tr",
    [string]$Username = "root",
    [string]$ProjectPath = "C:\Users\bali\Desktop\alo",
    [string]$RemotePath = "/var/www/alo17"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Alo17 Deployment Başlatılıyor..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Sunucu: $Username@$ServerIP" -ForegroundColor Yellow
Write-Host "Yerel Klasör: $ProjectPath" -ForegroundColor Yellow
Write-Host "Sunucu Klasör: $RemotePath" -ForegroundColor Yellow
Write-Host ""

# Proje klasörüne git
Set-Location $ProjectPath

# 1. Güncellenmiş dosyaları yükle
Write-Host "1. Güncellenmiş dosyalar yükleniyor..." -ForegroundColor Green

# Cron ve config dosyaları
Write-Host "   - Cron server dosyası yükleniyor..." -ForegroundColor Gray
scp cron-server.js ${Username}@${ServerIP}:${RemotePath}/cron-server.js

Write-Host "   - Ecosystem config yükleniyor..." -ForegroundColor Gray
scp ecosystem.config.js ${Username}@${ServerIP}:${RemotePath}/ecosystem.config.js

Write-Host "   - Package.json yükleniyor..." -ForegroundColor Gray
scp package.json ${Username}@${ServerIP}:${RemotePath}/package.json

# Components
Write-Host "   - Header component yükleniyor..." -ForegroundColor Gray
scp src/components/Header.tsx ${Username}@${ServerIP}:${RemotePath}/src/components/Header.tsx

# App pages
Write-Host "   - Ana sayfa yükleniyor..." -ForegroundColor Gray
scp src/app/page.tsx ${Username}@${ServerIP}:${RemotePath}/src/app/page.tsx

Write-Host "   - Premium sayfası yükleniyor..." -ForegroundColor Gray
scp src/app/premium/page.tsx ${Username}@${ServerIP}:${RemotePath}/src/app/premium/page.tsx

Write-Host "   - Kategori sayfası yükleniyor..." -ForegroundColor Gray
scp src/app/kategori/[slug]/page.tsx ${Username}@${ServerIP}:${RemotePath}/src/app/kategori/[slug]/page.tsx

Write-Host "   - Alt kategori sayfası yükleniyor..." -ForegroundColor Gray
ssh ${Username}@${ServerIP} "mkdir -p ${RemotePath}/src/app/kategori/[slug]/[subSlug]"
scp src/app/kategori/[slug]/[subSlug]/page.tsx ${Username}@${ServerIP}:${RemotePath}/src/app/kategori/[slug]/[subSlug]/page.tsx

Write-Host "   - İlan detay sayfası yükleniyor..." -ForegroundColor Gray
ssh ${Username}@${ServerIP} "mkdir -p ${RemotePath}/src/app/ilan/[id]"
scp src/app/ilan/[id]/page.tsx ${Username}@${ServerIP}:${RemotePath}/src/app/ilan/[id]/page.tsx

Write-Host "   - Admin ayarlar sayfası yükleniyor..." -ForegroundColor Gray
scp src/app/admin/ayarlar/page.tsx ${Username}@${ServerIP}:${RemotePath}/src/app/admin/ayarlar/page.tsx

Write-Host "   - Profil sayfası yükleniyor..." -ForegroundColor Gray
scp src/app/profil/page.tsx ${Username}@${ServerIP}:${RemotePath}/src/app/profil/page.tsx

Write-Host "   - İlan verme sayfası yükleniyor..." -ForegroundColor Gray
scp src/app/ilan-ver/page.tsx ${Username}@${ServerIP}:${RemotePath}/src/app/ilan-ver/page.tsx

# API routes
Write-Host "   - API routes yükleniyor..." -ForegroundColor Gray
scp src/app/api/admin/settings/route.ts ${Username}@${ServerIP}:${RemotePath}/src/app/api/admin/settings/route.ts
scp src/app/api/listings/category/[slug]/route.ts ${Username}@${ServerIP}:${RemotePath}/src/app/api/listings/category/[slug]/route.ts
scp src/app/api/listings/user/route.ts ${Username}@${ServerIP}:${RemotePath}/src/app/api/listings/user/route.ts
scp src/app/api/listings/favorites/route.ts ${Username}@${ServerIP}:${RemotePath}/src/app/api/listings/favorites/route.ts

Write-Host "   - İlan detay API route yükleniyor..." -ForegroundColor Gray
ssh ${Username}@${ServerIP} "mkdir -p ${RemotePath}/src/app/api/listings/[id]"
scp src/app/api/listings/[id]/route.ts ${Username}@${ServerIP}:${RemotePath}/src/app/api/listings/[id]/route.ts

# Eksik klasörleri oluştur ve API route'ları yükle
Write-Host "   - Cron API route klasörü oluşturuluyor..." -ForegroundColor Gray
ssh ${Username}@${ServerIP} "mkdir -p ${RemotePath}/src/app/api/cron/expire-listings"
scp src/app/api/cron/expire-listings/route.ts ${Username}@${ServerIP}:${RemotePath}/src/app/api/cron/expire-listings/route.ts

Write-Host "   - Renew API route klasörü oluşturuluyor..." -ForegroundColor Gray
ssh ${Username}@${ServerIP} "mkdir -p ${RemotePath}/src/app/api/listings/[id]/renew"
scp src/app/api/listings/[id]/renew/route.ts ${Username}@${ServerIP}:${RemotePath}/src/app/api/listings/[id]/renew/route.ts

# 2. Sunucuda build yap
Write-Host ""
Write-Host "2. Sunucuda build yapılıyor..." -ForegroundColor Green
Write-Host "   - .next klasörü temizleniyor..." -ForegroundColor Gray
ssh ${Username}@${ServerIP} "cd $RemotePath && rm -rf .next"
Write-Host "   - Bağımlılıklar kontrol ediliyor..." -ForegroundColor Gray
ssh ${Username}@${ServerIP} "cd $RemotePath && npm install"
Write-Host "   - Prisma client oluşturuluyor..." -ForegroundColor Gray
ssh ${Username}@${ServerIP} "cd $RemotePath && npx prisma generate"
Write-Host "   - Build yapılıyor..." -ForegroundColor Gray
ssh ${Username}@${ServerIP} "cd $RemotePath && npm run build"
Write-Host "   - Build kontrol ediliyor..." -ForegroundColor Gray
ssh ${Username}@${ServerIP} "cd $RemotePath && ls -la .next/prerender-manifest.json || echo 'HATA: prerender-manifest.json bulunamadı!'"

# 3. PM2'yi yeniden başlat
Write-Host ""
Write-Host "3. PM2 yeniden başlatılıyor..." -ForegroundColor Green
ssh ${Username}@${ServerIP} "cd $RemotePath && pm2 restart all"

# 4. Durum kontrolü
Write-Host ""
Write-Host "4. Uygulama durumu kontrol ediliyor..." -ForegroundColor Green
ssh ${Username}@${ServerIP} "pm2 list"
ssh ${Username}@${ServerIP} "pm2 logs alo17 --lines 20 --nostream"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Deployment tamamlandı!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

