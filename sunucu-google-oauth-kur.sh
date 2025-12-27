#!/bin/bash

# Sunucuya Google OAuth Kurulum Script'i
# Kullanım: ./sunucu-google-oauth-kur.sh [sunucu-ip] [kullanici-adi] [proje-yolu]

SERVER_IP="${1:-your-server-ip}"
USERNAME="${2:-your-username}"
PROJECT_PATH="${3:-/var/www/alo17}"

echo "=========================================="
echo "Sunucuya Google OAuth Kurulumu"
echo "=========================================="
echo "Sunucu: ${USERNAME}@${SERVER_IP}"
echo "Proje Yolu: ${PROJECT_PATH}"
echo ""

# 1. SSH Bağlantı Testi
echo "1. SSH Bağlantı Testi..."
ssh -o ConnectTimeout=5 -o BatchMode=yes ${USERNAME}@${SERVER_IP} echo "SSH bağlantısı başarılı" 2>&1
if [ $? -eq 0 ]; then
    echo "✓ SSH bağlantısı çalışıyor"
else
    echo "✗ SSH bağlantısı başarısız"
    exit 1
fi

echo ""

# 2. Proje dizini kontrolü
echo "2. Proje dizini kontrol ediliyor..."
ssh ${USERNAME}@${SERVER_IP} "cd ${PROJECT_PATH} && pwd" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "✗ Proje dizini bulunamadı: ${PROJECT_PATH}"
    echo "Lütfen doğru proje yolunu belirtin."
    exit 1
fi
echo "✓ Proje dizini bulundu"

echo ""

# 3. .env dosyası kontrolü
echo "3. .env dosyası kontrol ediliyor..."
ssh ${USERNAME}@${SERVER_IP} "cd ${PROJECT_PATH} && if [ ! -f .env ]; then touch .env; echo '⚠ .env dosyası oluşturuldu'; else echo '✓ .env dosyası mevcut'; fi"

echo ""

# 4. Mevcut .env içeriğini göster
echo "4. Mevcut .env içeriği:"
ssh ${USERNAME}@${SERVER_IP} "cd ${PROJECT_PATH} && cat .env"

echo ""
echo "=========================================="
echo "Google OAuth Bilgilerini Girin"
echo "=========================================="
echo ""
echo "Google Cloud Console'dan alın:"
echo "https://console.cloud.google.com/apis/credentials?project=jovial-circuit-460514-j9"
echo ""

read -p "Google Client ID'yi girin: " CLIENT_ID
read -p "Google Client Secret'ı girin: " CLIENT_SECRET

echo ""
read -p "Production domain'inizi girin (örn: alo17.tr) [Enter: alo17.tr]: " PRODUCTION_DOMAIN
PRODUCTION_DOMAIN=${PRODUCTION_DOMAIN:-alo17.tr}

# 5. NEXTAUTH_SECRET oluştur
echo ""
echo "5. NEXTAUTH_SECRET oluşturuluyor..."
NEXTAUTH_SECRET=$(ssh ${USERNAME}@${SERVER_IP} "cd ${PROJECT_PATH} && node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\" 2>/dev/null || openssl rand -base64 32")
echo "✓ NEXTAUTH_SECRET oluşturuldu"

echo ""

# 6. .env dosyasını güncelle
echo "6. .env dosyası güncelleniyor..."

ssh ${USERNAME}@${SERVER_IP} << EOF
cd ${PROJECT_PATH}

# Google OAuth değerlerini güncelle/ekle
if grep -q "GOOGLE_CLIENT_ID=" .env; then
    sed -i 's|GOOGLE_CLIENT_ID=.*|GOOGLE_CLIENT_ID=${CLIENT_ID}|' .env
else
    echo "GOOGLE_CLIENT_ID=${CLIENT_ID}" >> .env
fi

if grep -q "GOOGLE_CLIENT_SECRET=" .env; then
    sed -i 's|GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}|' .env
else
    echo "GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}" >> .env
fi

# NEXTAUTH_URL güncelle
if grep -q "NEXTAUTH_URL=" .env; then
    sed -i 's|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://${PRODUCTION_DOMAIN}|' .env
else
    echo "NEXTAUTH_URL=https://${PRODUCTION_DOMAIN}" >> .env
fi

# NEXTAUTH_SECRET güncelle
if grep -q "NEXTAUTH_SECRET=" .env; then
    sed -i 's|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=${NEXTAUTH_SECRET}|' .env
else
    echo "NEXTAUTH_SECRET=${NEXTAUTH_SECRET}" >> .env
fi

echo "✓ .env dosyası güncellendi"
EOF

echo ""

# 7. Güncellenmiş .env içeriğini göster (maskelenmiş)
echo "7. Güncellenmiş .env içeriği (gizli bilgiler maskelenmiş):"
ssh ${USERNAME}@${SERVER_IP} "cd ${PROJECT_PATH} && cat .env" | sed 's/GOOGLE_CLIENT_SECRET=.*/GOOGLE_CLIENT_SECRET=***MASKED***/' | sed 's/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=***MASKED***/'

echo ""

# 8. PM2 ile uygulamayı yeniden başlat
echo "8. Uygulama yeniden başlatılıyor..."
ssh ${USERNAME}@${SERVER_IP} "cd ${PROJECT_PATH} && pm2 restart alo17 2>/dev/null || pm2 restart all 2>/dev/null || echo 'PM2 komutu bulunamadı, manuel olarak yeniden başlatın'"

echo ""
echo "=========================================="
echo "✓ Kurulum Tamamlandı!"
echo "=========================================="
echo ""
echo "Önemli Notlar:"
echo "1. Google Cloud Console'da Authorized redirect URIs'e ekleyin:"
echo "   https://${PRODUCTION_DOMAIN}/api/auth/callback/google"
echo ""
echo "2. Authorized JavaScript origins'e ekleyin:"
echo "   https://${PRODUCTION_DOMAIN}"
echo ""
echo "3. Uygulama yeniden başlatıldı. Test edin:"
echo "   https://${PRODUCTION_DOMAIN}/giris"
echo ""

