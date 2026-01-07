#!/bin/bash
cd /var/www/alo17

# Eski SMTP ayarlarını sil
sed -i '/^SMTP_HOST=/d' .env
sed -i '/^SMTP_PORT=/d' .env
sed -i '/^SMTP_USER=/d' .env
sed -i '/^SMTP_PASS=/d' .env
sed -i '/^SMTP_FROM=/d' .env

# Yeni SMTP ayarlarını ekle
echo "" >> .env
echo "# SMTP Email (mail.kurumsaleposta.com)" >> .env
echo "SMTP_HOST=mail.kurumsaleposta.com" >> .env
echo "SMTP_PORT=465" >> .env
echo "SMTP_USER=destek@alo17.tr" >> .env
echo "SMTP_PASS=L19--AzF_jG1ij-3" >> .env
echo "SMTP_FROM=destek@alo17.tr" >> .env

# Ayarları göster
echo ""
echo "=== GUNCELLENMIS SMTP AYARLARI ==="
grep "^SMTP_" .env

# PM2'yi yeniden başlat
pm2 restart alo17 --update-env

