#!/usr/bin/env bash
# Alo17 sunucuda UFW firewall: gelen sadece SSH(2222), HTTP(80), HTTPS(443).
# Giden açık kalır (mail: SMTP 587/465 veya SendGrid 443).
# Sunucuda çalıştırın: bash setup-ufw-mail.sh
# Önce SSH portunuzun (2222) açık olduğundan emin olun; yoksa bağlantı kopar.

set -euo pipefail

SSH_PORT="${SSH_PORT:-2222}"

if ! command -v ufw &>/dev/null; then
  echo "UFW yüklü değil. Kurmak için: sudo apt-get update && sudo apt-get install -y ufw"
  exit 1
fi

echo "=============================================="
echo "UFW kurulumu (SSH ${SSH_PORT}, 80, 443)"
echo "=============================================="
echo ""
echo "Yapılacaklar:"
echo "  - Gelen: varsayılan red, sadece ${SSH_PORT}, 80, 443 izin"
echo "  - Giden: izinli (mail SMTP/HTTPS çalışır)"
echo ""
read -p "Devam edilsin mi? (y/N): " confirm
if [[ "${confirm}" != "y" && "${confirm}" != "Y" ]]; then
  echo "İptal edildi."
  exit 0
fi

# Önce SSH portunu aç ki kilitlenmeyelim
sudo ufw allow "${SSH_PORT}/tcp" comment 'SSH'
sudo ufw allow 80/tcp   comment 'HTTP'
sudo ufw allow 443/tcp  comment 'HTTPS'

# Varsayılanlar
sudo ufw default deny incoming
sudo ufw default allow outgoing

# UFW'yi etkinleştir (zaten aktifse değişmez)
sudo ufw --force enable

echo ""
echo "=============================================="
echo "UFW durumu:"
echo "=============================================="
sudo ufw status verbose | head -50

echo ""
echo "Bitti. Mail çıkışı (SMTP 587/465 veya SendGrid 443) giden varsayılan allow ile açık."
