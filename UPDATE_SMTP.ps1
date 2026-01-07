# SMTP Ayarlarını Güncelle
# mail.kurumsaleposta.com için SSL portu 465 kullanılacak

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "SMTP AYARLARI GUNCELLENIYOR" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Yeni SMTP ayarlari:" -ForegroundColor White
Write-Host "  Host: mail.kurumsaleposta.com" -ForegroundColor Green
Write-Host "  Port: 465 (SSL)" -ForegroundColor Green
Write-Host "  User: destek@alo17.tr" -ForegroundColor Green
Write-Host ""

$command = @"
cd /var/www/alo17

# Eski SMTP ayarlarını sil
sed -i '/^SMTP_HOST=/d' .env
sed -i '/^SMTP_PORT=/d' .env
sed -i '/^SMTP_USER=/d' .env
sed -i '/^SMTP_PASS=/d' .env
sed -i '/^SMTP_FROM=/d' .env

# Yeni SMTP ayarlarını ekle
echo '' >> .env
echo '# SMTP Email (mail.kurumsaleposta.com)' >> .env
echo 'SMTP_HOST=mail.kurumsaleposta.com' >> .env
echo 'SMTP_PORT=465' >> .env
echo 'SMTP_USER=destek@alo17.tr' >> .env
echo 'SMTP_PASS=L19--AzF_jG1ij-3' >> .env
echo 'SMTP_FROM=destek@alo17.tr' >> .env

# Ayarları kontrol et
echo ''
echo '=== GUNCELLENMIS SMTP AYARLARI ==='
grep '^SMTP_' .env

# PM2'yi yeniden başlat
pm2 restart alo17 --update-env
"@

Write-Host "Sunucuda calistirilacak komut:" -ForegroundColor Yellow
Write-Host ""
Write-Host "ssh root@alo17.tr `"$command`"" -ForegroundColor Cyan
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Komutu kopyalayip calistirabilirsiniz." -ForegroundColor White

