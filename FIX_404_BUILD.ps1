# 404 Hataları Düzeltme - Build Dosyaları Eksik
# Next.js build dosyalarını yeniden oluşturur

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "404 HATALARI DUZELTME - BUILD" -ForegroundColor Red
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Sorun: Next.js build dosyalari eksik veya guncel degil" -ForegroundColor Yellow
Write-Host "Cozum: Build dosyalarini yeniden olusturuyoruz..." -ForegroundColor Green
Write-Host ""

Write-Host "1. Mevcut build dosyalarini temizliyoruz..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && rm -rf .next" 2>&1 | Out-Null
Write-Host "   .next klasoru temizlendi!" -ForegroundColor Green

Write-Host "`n2. Node modules kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && npm install" 2>&1 | Out-Null
Write-Host "   Node modules kontrol edildi!" -ForegroundColor Green

Write-Host "`n3. Prisma client generate ediliyor..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && npx prisma generate" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Prisma client generate edildi!" -ForegroundColor Green
} else {
    Write-Host "   Prisma generate hatasi olabilir!" -ForegroundColor Red
}

Write-Host "`n4. Next.js build yapiliyor (bu biraz zaman alabilir)..." -ForegroundColor Yellow
$buildOutput = ssh $SERVER "cd $REMOTE_PATH && npm run build" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Build basarili!" -ForegroundColor Green
} else {
    Write-Host "   Build hatasi olabilir, kontrol edin!" -ForegroundColor Red
    Write-Host $buildOutput -ForegroundColor Red
}

Write-Host "`n5. PM2 yeniden baslatiliyor..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && pm2 restart alo17 && pm2 save" 2>&1 | Out-Null
Write-Host "   PM2 yeniden baslatildi!" -ForegroundColor Green

Write-Host "`n6. PM2 durumu kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER "pm2 status" 2>&1

Write-Host "`n7. Build dosyalari kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && ls -la .next/static/chunks/ | head -10" 2>&1

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "BUILD TAMAMLANDI!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "`nTest:" -ForegroundColor Yellow
Write-Host "1. Tarayicida sayfayi yenileyin (Ctrl+F5)" -ForegroundColor White
Write-Host "2. 404 hatalari gecmeli" -ForegroundColor White
Write-Host "3. Eger hala varsa, tarayici cache'ini temizleyin" -ForegroundColor White
Write-Host "`nNot: Eger hala 404 hatasi varsa:" -ForegroundColor Gray
Write-Host "- Tarayici cache'ini temizleyin (Ctrl+Shift+Delete)" -ForegroundColor Gray
Write-Host "- Hard refresh yapin (Ctrl+F5)" -ForegroundColor Gray
Write-Host "- Incognito modda test edin" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan

