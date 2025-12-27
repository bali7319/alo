#!/bin/bash

# Sunucu Durum Kontrol Script'i
# Kullanım: ./check-server.sh [sunucu-ip] [kullanici-adi]

SERVER_IP="${1:-your-server-ip}"
USERNAME="${2:-your-username}"

echo "=========================================="
echo "Sunucu Durum Kontrolü"
echo "=========================================="
echo "Sunucu: $USERNAME@$SERVER_IP"
echo ""

# 1. SSH Bağlantı Testi
echo "1. SSH Bağlantı Testi..."
ssh -o ConnectTimeout=5 -o BatchMode=yes $USERNAME@$SERVER_IP echo "SSH bağlantısı başarılı" 2>&1
if [ $? -eq 0 ]; then
    echo "✓ SSH bağlantısı çalışıyor"
else
    echo "✗ SSH bağlantısı başarısız"
    exit 1
fi

echo ""

# 2. Disk Kullanımı
echo "2. Disk Kullanımı:"
ssh $USERNAME@$SERVER_IP "df -h / | tail -1"

echo ""

# 3. Bellek Kullanımı
echo "3. Bellek Kullanımı:"
ssh $USERNAME@$SERVER_IP "free -h"

echo ""

# 4. PM2 Durumu
echo "4. PM2 Durumu:"
ssh $USERNAME@$SERVER_IP "pm2 list"

echo ""

# 5. Next.js Uygulama Durumu
echo "5. Next.js Uygulama Durumu:"
ssh $USERNAME@$SERVER_IP "pm2 info alo17 2>/dev/null || echo 'PM2 uygulaması bulunamadı'"

echo ""

# 6. Port 3000 Kontrolü
echo "6. Port 3000 Kontrolü:"
ssh $USERNAME@$SERVER_IP "netstat -tuln | grep :3000 || ss -tuln | grep :3000 || echo 'Port 3000 dinlenmiyor'"

echo ""

# 7. Son Loglar (son 10 satır)
echo "7. Son PM2 Loglar (Error):"
ssh $USERNAME@$SERVER_IP "tail -10 /var/www/alo17/logs/error.log 2>/dev/null || echo 'Log dosyası bulunamadı'"

echo ""

# 8. Git Durumu
echo "8. Git Durumu:"
ssh $USERNAME@$SERVER_IP "cd /var/www/alo17 && git status 2>&1 | head -5"

echo ""

# 9. Node.js ve NPM Versiyonları
echo "9. Node.js ve NPM Versiyonları:"
ssh $USERNAME@$SERVER_IP "node --version && npm --version"

echo ""

# 10. .env Dosyası Kontrolü
echo "10. .env Dosyası Kontrolü:"
ssh $USERNAME@$SERVER_IP "cd /var/www/alo17 && if [ -f .env ]; then echo '✓ .env dosyası mevcut'; ls -lh .env; else echo '✗ .env dosyası bulunamadı'; fi"

echo ""

# 11. Database Bağlantı Testi (Prisma)
echo "11. Database Bağlantı Testi:"
ssh $USERNAME@$SERVER_IP "cd /var/www/alo17 && npx prisma db pull --preview-feature 2>&1 | head -3 || echo 'Database bağlantı testi yapılamadı'"

echo ""
echo "=========================================="
echo "Kontrol tamamlandı"
echo "=========================================="

