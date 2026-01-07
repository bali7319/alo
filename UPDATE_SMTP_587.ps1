# SMTP Ayarlarını Güncelle - mail.kurumsaleposta.com (Port 587, STARTTLS: false)
# Görseldeki destek mesajına göre güncelleniyor

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "SMTP AYARLARI GUNCELLENIYOR" -ForegroundColor Yellow
Write-Host "mail.kurumsaleposta.com - Port 587" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Yeni SMTP ayarlari:" -ForegroundColor White
Write-Host "  Host: mail.kurumsaleposta.com" -ForegroundColor Green
Write-Host "  Port: 587" -ForegroundColor Green
Write-Host "  SSL/TLS: Kapalı" -ForegroundColor Green
Write-Host "  STARTTLS: false" -ForegroundColor Green
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

# Yeni SMTP ayarlarını ekle (mail.kurumsaleposta.com - Port 587)
echo '' >> .env
echo '# SMTP Email (mail.kurumsaleposta.com - Port 587, STARTTLS: false)' >> .env
echo 'SMTP_HOST=mail.kurumsaleposta.com' >> .env
echo 'SMTP_PORT=587' >> .env
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
Write-Host "VEYA TEK SATIRDA:" -ForegroundColor Yellow
Write-Host ""
$singleLine = "ssh root@alo17.tr 'cd /var/www/alo17 && sed -i \"/^SMTP_HOST=/d; /^SMTP_PORT=/d; /^SMTP_USER=/d; /^SMTP_PASS=/d; /^SMTP_FROM=/d\" .env && echo \"\" >> .env && echo \"# SMTP Email (mail.kurumsaleposta.com - Port 587, STARTTLS: false)\" >> .env && echo \"SMTP_HOST=mail.kurumsaleposta.com\" >> .env && echo \"SMTP_PORT=587\" >> .env && echo \"SMTP_USER=destek@alo17.tr\" >> .env && echo \"SMTP_PASS=L19--AzF_jG1ij-3\" >> .env && echo \"SMTP_FROM=destek@alo17.tr\" >> .env && grep \"^SMTP_\" .env && pm2 restart alo17 --update-env'"
Write-Host $singleLine -ForegroundColor Cyan
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOT: email.ts dosyasi da guncellendi (requireTLS: false)" -ForegroundColor Yellow
Write-Host "     email.ts dosyasini sunucuya yuklemeyi unutmayin!" -ForegroundColor Yellow
Write-Host ""

