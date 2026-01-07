# SMTP Ayarlarını Güncelle - Basit Versiyon
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "SMTP AYARLARI GUNCELLENIYOR" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Adım 1: Eski ayarları sil
Write-Host "1. Eski SMTP ayarlari siliniyor..." -ForegroundColor White
$step1 = "ssh root@alo17.tr 'cd /var/www/alo17 && sed -i \"/^SMTP_HOST=/d\" .env && sed -i \"/^SMTP_PORT=/d\" .env && sed -i \"/^SMTP_USER=/d\" .env && sed -i \"/^SMTP_PASS=/d\" .env && sed -i \"/^SMTP_FROM=/d\" .env'"
Write-Host $step1 -ForegroundColor Cyan
Write-Host ""

# Adım 2: Yeni ayarları ekle
Write-Host "2. Yeni SMTP ayarlari ekleniyor..." -ForegroundColor White
$step2 = "ssh root@alo17.tr 'cd /var/www/alo17 && echo \"\" >> .env && echo \"# SMTP Email (mail.kurumsaleposta.com)\" >> .env && echo \"SMTP_HOST=mail.kurumsaleposta.com\" >> .env && echo \"SMTP_PORT=465\" >> .env && echo \"SMTP_USER=destek@alo17.tr\" >> .env && echo \"SMTP_PASS=L19--AzF_jG1ij-3\" >> .env && echo \"SMTP_FROM=destek@alo17.tr\" >> .env'"
Write-Host $step2 -ForegroundColor Cyan
Write-Host ""

# Adım 3: Kontrol et ve restart
Write-Host "3. Ayarlari kontrol et ve restart..." -ForegroundColor White
$step3 = "ssh root@alo17.tr 'cd /var/www/alo17 && grep \"^SMTP_\" .env && pm2 restart alo17 --update-env'"
Write-Host $step3 -ForegroundColor Cyan
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "VEYA TEK KOMUT:" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$fullCommand = @"
ssh root@alo17.tr 'cd /var/www/alo17 && sed -i "/^SMTP_HOST=/d; /^SMTP_PORT=/d; /^SMTP_USER=/d; /^SMTP_PASS=/d; /^SMTP_FROM=/d" .env && echo "" >> .env && echo "# SMTP Email (mail.kurumsaleposta.com)" >> .env && echo "SMTP_HOST=mail.kurumsaleposta.com" >> .env && echo "SMTP_PORT=465" >> .env && echo "SMTP_USER=destek@alo17.tr" >> .env && echo "SMTP_PASS=L19--AzF_jG1ij-3" >> .env && echo "SMTP_FROM=destek@alo17.tr" >> .env && grep "^SMTP_" .env && pm2 restart alo17 --update-env'
"@

Write-Host $fullCommand -ForegroundColor Green
Write-Host ""

