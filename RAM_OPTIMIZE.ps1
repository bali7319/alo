# RAM Optimizasyonu
# Yüksek RAM kullanımını azaltmak için

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "RAM Optimizasyonu" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. En çok RAM kullanan process'ler
Write-Host "1. En çok RAM kullanan process'ler..." -ForegroundColor Yellow
ssh $SERVER "ps aux --sort=-%mem | head -15" 2>&1

# 2. PM2 Memory Kullanımı
Write-Host "`n2. PM2 memory kullanımı..." -ForegroundColor Yellow
ssh $SERVER "pm2 list" 2>&1

# 3. Cache Temizleme
Write-Host "`n3. Cache temizleniyor..." -ForegroundColor Yellow
ssh $SERVER "sync && echo 3 > /proc/sys/vm/drop_caches && echo 'Cache temizlendi'" 2>&1

# 4. Swap Kullanımı
Write-Host "`n4. Swap kullanımı..." -ForegroundColor Yellow
ssh $SERVER "free -h" 2>&1

# 5. Node.js Memory Limit Kontrolü
Write-Host "`n5. Node.js memory ayarları..." -ForegroundColor Yellow
ssh $SERVER "cd $REMOTE_PATH && cat ecosystem.config.js | grep max_memory" 2>&1

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "RAM Optimizasyonu Tamamlandı" -ForegroundColor Green
Write-Host "`nÖNERİLER:" -ForegroundColor Yellow
Write-Host "- PM2 memory limiti: 3G (zaten ayarlı)" -ForegroundColor White
Write-Host "- Gereksiz process'leri kapatın" -ForegroundColor White
Write-Host "- Swap kullanımını azaltın" -ForegroundColor White
Write-Host "- Düzenli cache temizleme yapın" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan

