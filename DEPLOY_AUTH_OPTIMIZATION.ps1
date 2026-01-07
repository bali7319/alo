# Production-Ready Auth Optimization Deploy Script
# Senior Google Developer Standards: Memory optimization, clean code, security

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "AUTH OPTIMIZATION DEPLOY" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"
$FILE = "src/lib/auth.ts"

Write-Host "1. Dosya yukleniyor..." -ForegroundColor Yellow
scp $FILE ${SERVER}:${REMOTE_PATH}/${FILE}
if ($LASTEXITCODE -ne 0) {
    Write-Host "HATA: Dosya yuklenemedi!" -ForegroundColor Red
    exit 1
}

Write-Host "2. Build ve restart..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && npm run build && pm2 restart alo17"
if ($LASTEXITCODE -ne 0) {
    Write-Host "HATA: Build veya restart basarisiz!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "DEPLOY BASARILI!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Yapilan iyilestirmeler:" -ForegroundColor Yellow
Write-Host "- Debug loglari sadece development/DEBUG_AUTH ile aktif" -ForegroundColor White
Write-Host "- Hassas bilgiler maskeleniyor" -ForegroundColor White
Write-Host "- Memory optimizasyonu (lazy import, select)" -ForegroundColor White
Write-Host "- Email case-insensitive" -ForegroundColor White
Write-Host "- Password hash format validation" -ForegroundColor White
Write-Host "- Performance tracking" -ForegroundColor White
Write-Host ""
Write-Host "Test:" -ForegroundColor Yellow
Write-Host "pm2 logs alo17 --lines 20 | grep -i auth" -ForegroundColor Cyan
Write-Host ""

