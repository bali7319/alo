# Güvenlik Kontrolü ve Temizlik
# XMRig saldırısı ve yüksek RAM kullanımı için kontrol

$SERVER = "root@alo17.tr"
$REMOTE_PATH = "/var/www/alo17"

Write-Host "==========================================" -ForegroundColor Red
Write-Host "GÜVENLİK KONTROLÜ VE TEMİZLİK" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Red
Write-Host ""

# 1. Şüpheli Process'leri Kontrol Et
Write-Host "1. Şüpheli process'ler kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER "ps aux | grep -E 'xmrig|miner|crypto|stratum' | grep -v grep" 2>&1

# 2. CPU Kullanımı (Yüksek kullanım crypto miner işareti olabilir)
Write-Host "`n2. CPU kullanımı kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER "top -bn1 | head -20" 2>&1

# 3. Network Bağlantıları (Şüpheli bağlantılar)
Write-Host "`n3. Network bağlantıları kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER "netstat -tulpn | grep -E 'ESTABLISHED|LISTEN' | head -20" 2>&1

# 4. RAM Kullanımı Detayı
Write-Host "`n4. RAM kullanımı detayı..." -ForegroundColor Yellow
ssh $SERVER "free -h && echo '---' && ps aux --sort=-%mem | head -10" 2>&1

# 5. Cron Jobs Kontrolü (Şüpheli cron job'lar)
Write-Host "`n5. Cron jobs kontrol ediliyor..." -ForegroundColor Yellow
ssh $SERVER "crontab -l 2>/dev/null || echo 'Crontab yok'" 2>&1
ssh $SERVER "ls -la /etc/cron.d/ /etc/cron.hourly/ /etc/cron.daily/ 2>/dev/null | head -20" 2>&1

# 6. Şüpheli Dosyalar
Write-Host "`n6. Şüpheli dosyalar aranıyor..." -ForegroundColor Yellow
ssh $SERVER "find /tmp /var/tmp -name '*xmrig*' -o -name '*miner*' 2>/dev/null | head -10" 2>&1

Write-Host "`n==========================================" -ForegroundColor Red
Write-Host "KONTROL TAMAMLANDI" -ForegroundColor Yellow
Write-Host "`nÖNERİLER:" -ForegroundColor Cyan
Write-Host "1. Şüpheli process'ler varsa kill edin" -ForegroundColor White
Write-Host "2. Şüpheli cron job'ları temizleyin" -ForegroundColor White
Write-Host "3. Şifreleri değiştirin" -ForegroundColor White
Write-Host "4. Fail2ban kurun (brute force koruması)" -ForegroundColor White
Write-Host "5. Firewall kurallarını kontrol edin" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Red

