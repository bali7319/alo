#!/bin/bash
cd /var/www/alo17

# Güvenlik: SMTP şifresini repoya yazma. Çalıştırmadan önce env ver veya interaktif sor.
if [ -z "${SMTP_PASS}" ]; then
  read -s -p "SMTP_PASS (for destek@alo17.tr): " SMTP_PASS
  echo
fi

# Eski SMTP ayarlarını sil
sed -i '/^SMTP_HOST=/d' .env
sed -i '/^SMTP_PORT=/d' .env
sed -i '/^SMTP_USER=/d' .env
sed -i '/^SMTP_PASS=/d' .env
sed -i '/^SMTP_FROM=/d' .env

# Yeni SMTP ayarlarını ekle (mail.kurumsaleposta.com - Port 587, STARTTLS: false)
echo '' >> .env
echo '# SMTP Email (mail.kurumsaleposta.com - Port 587, STARTTLS: false)' >> .env
echo 'SMTP_HOST=mail.kurumsaleposta.com' >> .env
echo 'SMTP_PORT=587' >> .env
echo 'SMTP_USER=destek@alo17.tr' >> .env
echo "SMTP_PASS=$SMTP_PASS" >> .env
echo 'SMTP_FROM=destek@alo17.tr' >> .env

# Ayarları kontrol et
echo ''
echo '=== GUNCELLENMIS SMTP AYARLARI ==='
grep '^SMTP_' .env

# PM2'yi yeniden başlat
pm2 restart alo17 --update-env

